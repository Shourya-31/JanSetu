import readline from 'readline';
import prisma from '../config/prisma';
import { hashPassword } from '../utils/password';

const SURVEYOR_USER_CODES = ['surveyor', 'survey01'] as const;
const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

class UserCancelledError extends Error {}
class UserInputError extends Error {}

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
      for (const character of chunk.toString()) {
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
        } else if (character >= ' ') {
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

async function resetSurveyorPasswords(): Promise<void> {
  console.log('Surveyor password reset utility');
  console.log('Passwords are read without being displayed and are never printed.');

  const surveyorPassword = await askHidden('New password for surveyor: ');
  const survey01Password = await askHidden('New password for survey01: ');
  validatePassword(surveyorPassword, 'surveyor password');
  validatePassword(survey01Password, 'survey01 password');

  const [surveyor, survey01] = await Promise.all(
    SURVEYOR_USER_CODES.map((userCode) => prisma.user.findUnique({
      where: { userCode },
      select: { id: true, role: true }
    }))
  );

  if (!surveyor || !survey01) {
    throw new UserInputError('Both required Surveyor accounts must exist; no changes were made');
  }
  if (surveyor.role !== 'surveyor' || survey01.role !== 'surveyor') {
    throw new UserInputError('Both required accounts must have the Surveyor role; no changes were made');
  }

  const [surveyorPasswordHash, survey01PasswordHash] = await Promise.all([
    hashPassword(surveyorPassword),
    hashPassword(survey01Password)
  ]);

  const confirmed = await askHidden('Type the confirmation word "yes" (input hidden): ');
  if (confirmed.toLowerCase() !== 'yes') {
    throw new UserCancelledError('No changes were made');
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: surveyor.id },
      data: { passwordHash: surveyorPasswordHash }
    });
    await transaction.user.update({
      where: { id: survey01.id },
      data: { passwordHash: survey01PasswordHash }
    });
  }, { timeout: 15000 });

  console.log('Surveyor password reset committed successfully.');
}

if (require.main === module) {
  resetSurveyorPasswords()
    .catch((error: unknown) => {
      if (error instanceof UserCancelledError || error instanceof UserInputError) {
        console.error(`Surveyor password reset failed: ${error.message}`);
      } else {
        console.error('Surveyor password reset failed. No changes were committed.');
      }
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { resetSurveyorPasswords };
