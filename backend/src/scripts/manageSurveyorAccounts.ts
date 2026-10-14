import readline from 'readline';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';

const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;

class UserCancelledError extends Error {}
class UserInputError extends Error {}

function ask(question: string): Promise<string> {
  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    input.question(question, (answer) => {
      input.close();
      resolve(answer.trim());
    });
  });
}

function askHidden(question: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('Hidden password input requires an interactive terminal');
  }

  return new Promise((resolve, reject) => {
    let answer = '';
    const wasRaw = process.stdin.isRaw;

    const cleanup = () => {
      process.stdin.setRawMode?.(wasRaw ?? false);
      process.stdin.pause();
      process.stdin.removeListener('data', onData);
      process.stdin.removeListener('error', onError);
      process.stdout.write('\n');
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onData = (chunk: Buffer | string) => {
      const input = chunk.toString();

      for (const character of input) {
        if (character === '\u0003') {
          cleanup();
          reject(new UserCancelledError('Operation cancelled'));
          return;
        }
        if (character === '\r' || character === '\n') {
          cleanup();
          resolve(answer);
          return;
        }
        if (character === '\b' || character === '\u007f') {
          answer = answer.slice(0, -1);
        } else if (character >= ' ' && character !== '\u007f') {
          answer += character;
        }
      }
    };

    process.stdout.write(question);
    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on('data', onData);
    process.stdin.once('error', onError);
  });
}

function validatePassword(password: string, label: string): void {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new UserInputError(`${label} must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`);
  }
}

async function manageSurveyorAccounts(): Promise<void> {
  console.log('Surveyor account manager');
  console.log('This changes one existing surveyor password and creates one new surveyor account.');

  const existingUserCode = await ask('Existing Surveyor userCode: ');
  const newUserCode = await ask('New Surveyor userCode: ');
  const newFullName = await ask('New Surveyor full name: ');
  const existingPassword = await askHidden('New password for existing Surveyor: ');
  const newPassword = await askHidden('Password for new Surveyor: ');

  if (!existingUserCode || !newUserCode || !newFullName) {
    throw new UserInputError('userCode and full name values must not be empty');
  }
  if (existingUserCode === newUserCode) {
    throw new UserInputError('Existing and new userCodes must be different');
  }
  validatePassword(existingPassword, 'Existing Surveyor password');
  validatePassword(newPassword, 'New Surveyor password');

  const existingUser = await prisma.user.findUnique({
    where: { userCode: existingUserCode },
    select: { id: true, userCode: true, fullName: true, role: true }
  });

  if (!existingUser) {
    throw new UserInputError(`Surveyor userCode "${existingUserCode}" was not found`);
  }
  if (existingUser.role !== 'surveyor') {
    throw new UserInputError(`UserCode "${existingUserCode}" does not belong to a surveyor account`);
  }

  const newUser = await prisma.user.findUnique({
    where: { userCode: newUserCode },
    select: { id: true }
  });

  if (newUser) {
    throw new UserInputError(`New userCode "${newUserCode}" already exists; no changes were made`);
  }

  const confirmed = await ask(
    `Confirm changing "${existingUser.userCode}" (${existingUser.fullName}) and creating ` +
    `"${newUserCode}" (${newFullName}) as surveyor accounts? Type "yes" to commit: `
  );
  if (confirmed.toLowerCase() !== 'yes') {
    throw new UserCancelledError('No changes were made');
  }

  const [existingPasswordHash, newPasswordHash] = await Promise.all([
    hashPassword(existingPassword),
    hashPassword(newPassword)
  ]);

  await prisma.$transaction(async (transaction) => {

    await transaction.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: existingPasswordHash }
    });

    await transaction.user.create({
      data: {
        userCode: newUserCode,
        fullName: newFullName,
        role: 'surveyor',
        passwordHash: newPasswordHash
      }
    });
  }, { timeout: 15000 });

  console.log('Surveyor account changes committed successfully.');
}

if (require.main === module) {
  manageSurveyorAccounts()
    .catch((error: unknown) => {
      if (error instanceof UserCancelledError) {
        console.log(error.message);
      } else if (error instanceof UserInputError) {
        console.error(`Surveyor account changes failed: ${error.message}`);
      } else {
        console.error('Surveyor account changes failed. No changes were committed.');
      }
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { manageSurveyorAccounts };
