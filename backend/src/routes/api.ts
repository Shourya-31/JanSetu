import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { getCurrentUser, login, logout } from '../controllers/authController';
import { getAllVillageProfiles, getVillageProfile, saveVillageProfile, finalizeVillageProfile, patchVillageProfile, deleteVillageProfile } from '../controllers/villageController';
import { getHouseholdSurveys, createHouseholdSlots, saveHouseholdSurvey, patchHouseholdSurvey, deleteHouseholdSurvey, verifyHouseholdRecord, updateRegistryStatusRecord, createCorrectionTicketRecord } from '../controllers/householdController';
import { queryAdminHouseholds, getAnalyticsSummary } from '../controllers/adminController';
import { exportHouseholdsCsv } from '../controllers/exportController';
import { getAdminSurveys, getAdminGramStats } from '../controllers/adminReportController';
import { getHierarchy } from '../controllers/hierarchyController';
import { getSurveyAuditLogs } from '../controllers/auditController';
import { uploadImage } from '../controllers/uploadController';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  boundedSurveyObjectSchema,
  householdAnswerSchema,
  householdSlotInitializationSchema,
  householdSubmissionEnvelopeSchema,
  villageProfileBodySchema,
  villageSurveySchema
} from './surveySchemas';
import { AppError, ERROR_CODES } from '../utils/errors';

async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch (error) {
    throw new AppError(ERROR_CODES.AUTHENTICATION_ERROR, 'Authentication is required.', 401, undefined, { cause: error, retryable: false });
  }
}

async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await requireAuth(req, reply);
  if (reply.sent) return;
  const claims = req.user as { role?: string };
  if (claims.role !== 'admin') {
    throw new AppError(ERROR_CODES.AUTHORIZATION_ERROR, 'Administrator access is required.', 403, undefined, { retryable: false });
  }
}

const authenticated = { preHandler: requireAuth };
const adminOnly = { preHandler: requireAdmin };
const idParamsSchema = {
  type: 'object',
  required: ['id'],
  additionalProperties: false,
  properties: { id: { type: 'string', minLength: 1, maxLength: 64 } }
};
const text = (maxLength = 200) => ({ type: 'string', minLength: 1, maxLength, pattern: '\\S' });
const count = { type: 'integer', minimum: 0, maximum: 10000000 };
const yesNoFilter = { type: 'string', enum: ['Yes', 'No', 'हां', 'नहीं'] };
const auditStatusFilter = {
  type: 'string', enum: ['All', 'सभी', 'Verified', 'सत्यापित', 'Pending', 'लंबित', 'Flagged', 'फ्लैग']
};
const registryStatusFilter = {
  type: 'string', enum: [
    'All', 'सभी', 'Verified', 'सत्यापित', 'Pending', 'लंबित', 'Needs Correction', 'सुधार आवश्यक',
    'Re-verification Needed', 'पुनः सत्यापन आवश्यक', 'Closed', 'बंद'
  ]
};
const loginSchema = {
  body: {
    type: 'object',
    required: ['role', 'identifier', 'password'],
    additionalProperties: false,
    properties: {
      role: { type: 'string', enum: ['admin', 'surveyor'] },
      identifier: { ...text(128), pattern: '\\S' },
      password: { type: 'string', minLength: 8, maxLength: 128 }
    }
  }
};
const adminFilterSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    block: text(), panchayat: text(), village: text(), isBPL: yesNoFilter, caste: text(100), isMiningWorker: yesNoFilter,
    hasMissingDocs: { type: 'boolean' }, hasUnemployed: { type: 'boolean' },
    auditStatus: auditStatusFilter, registryStatus: registryStatusFilter, hasTicket: { type: 'boolean' },
    houseNumber: { anyOf: [{ type: 'integer', minimum: 1 }, { type: 'string', pattern: '^[1-9][0-9]{0,7}$' }] },
    searchQuery: { type: 'string', maxLength: 200 }
  }
};
const querySchema = (properties: Record<string, unknown>, required: string[] = []) => ({
  type: 'object', required, additionalProperties: false, properties
});
const emptyQuerySchema = querySchema({});

export async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook('onSend', async (req, reply) => {
    reply.header('Keep-Alive', 'timeout=5, max=1000');
    reply.header('X-Content-Type-Options', 'nosniff');
    if (req.method === 'GET') {
      reply.header('Cache-Control', 'private, no-cache, no-transform');
    }
  });

  // 1. Auth & Location Hierarchy Routes
  fastify.post('/api/auth/login', {
    schema: { ...loginSchema, querystring: emptyQuerySchema },
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } }
  }, login);
  fastify.get('/api/auth/me', {
    ...authenticated,
    schema: { querystring: emptyQuerySchema }
  }, getCurrentUser);
  fastify.post('/api/auth/logout', {
    schema: { querystring: emptyQuerySchema }
  }, logout);
  fastify.get('/api/hierarchy', {
    ...authenticated,
    schema: { querystring: emptyQuerySchema }
  }, getHierarchy);
  
  fastify.post('/api/upload/image', {
    ...authenticated
  }, uploadImage);

  // 2. Village Profile Routes
  fastify.get('/api/villages/all', {
    ...authenticated,
    schema: { querystring: emptyQuerySchema }
  }, getAllVillageProfiles);
  fastify.get('/api/villages/profile', {
    ...authenticated,
    schema: { querystring: querySchema({ villageId: { type: 'integer', minimum: 1 }, villageName: text(), block: text(), panchayat: text() }) }
  }, getVillageProfile);
  fastify.post('/api/villages/profile', {
    ...authenticated,
    schema: { body: villageProfileBodySchema, querystring: emptyQuerySchema }
  }, saveVillageProfile);
  fastify.post('/api/villages/:id/finalize', {
    ...authenticated,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object',
        required: ['version'],
        additionalProperties: false,
        properties: { version: { type: 'integer', minimum: 1 } }
      }
    }
  }, finalizeVillageProfile);
  fastify.patch('/api/villages/:id', {
    ...authenticated,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object', required: ['version'], minProperties: 2, additionalProperties: false,
        properties: {
          version: { type: 'integer', minimum: 1 },
          totalPopulation: count, totalHouseholds: count,
          quality: boundedSurveyObjectSchema, gapMatrix: boundedSurveyObjectSchema, villageSurvey: villageSurveySchema
        }
      }
    }
  }, patchVillageProfile);
  fastify.delete('/api/villages/:id', {
    ...adminOnly,
    schema: { params: idParamsSchema, querystring: emptyQuerySchema }
  }, deleteVillageProfile);

  // 3. Household Survey Routes
  fastify.get('/api/households', {
    ...authenticated,
    schema: {
      querystring: {
        ...querySchema({
          villageName: text(),
          villageId: { anyOf: [{ type: 'integer', minimum: 1 }, { const: 'NaN' }] },
          block: text(),
          panchayat: text()
        }),
        anyOf: [{ required: ['villageName'] }, { required: ['villageId'] }]
      }
    }
  }, getHouseholdSurveys);
  fastify.post('/api/households/initialize', {
    ...authenticated,
    schema: { querystring: emptyQuerySchema, body: householdSlotInitializationSchema }
  }, createHouseholdSlots);
  fastify.post('/api/households', {
    ...authenticated,
    schema: { body: householdSubmissionEnvelopeSchema, querystring: emptyQuerySchema }
  }, saveHouseholdSurvey);
  fastify.patch('/api/households/:id', {
    ...authenticated,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object', required: ['version'], minProperties: 2, additionalProperties: false,
        properties: {
          version: { type: 'integer', minimum: 1 },
          headName: text(), mobile: { type: 'string', maxLength: 32 }, caste: text(100),
          isBPL: text(100), totalMembers: count, eldersCount: count, childrenCount: count,
          unemployedCount: count, incomeSource: text(), missingAadhaar: count,
          missingCasteCert: count, missingAyushman: count, missingVoterId: count,
          isMiningWorker: text(100), houseType: text(100), hasToilet: text(100),
          hasTapWater: text(100), surveyAnswers: householdAnswerSchema, data: householdAnswerSchema
        }
      }
    }
  }, patchHouseholdSurvey);
  fastify.delete('/api/households/:id', {
    ...adminOnly,
    schema: { params: idParamsSchema, querystring: emptyQuerySchema }
  }, deleteHouseholdSurvey);
  fastify.patch('/api/households/:id/verify', {
    ...adminOnly,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object', additionalProperties: false,
        properties: { result: { type: 'string', enum: ['सत्यापित', 'विसंगति मिली', 'पुनः सत्यापन आवश्यक'] } }
      }
    }
  }, verifyHouseholdRecord);
  fastify.patch('/api/households/:id/registry', {
    ...adminOnly,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object', required: ['status'], additionalProperties: false,
        properties: { status: { type: 'string', enum: ['लंबित', 'सत्यापित', 'सुधार आवश्यक', 'पुनः सत्यापन आवश्यक', 'बंद'] } }
      }
    }
  }, updateRegistryStatusRecord);
  fastify.post('/api/households/:id/ticket', {
    ...adminOnly,
    schema: {
      params: idParamsSchema,
      querystring: emptyQuerySchema,
      body: {
        type: 'object', required: ['reason'], additionalProperties: false,
        properties: { reason: text(500), note: { type: 'string', maxLength: 2000 } }
      }
    }
  }, createCorrectionTicketRecord);

  // 4. Admin Dynamic Query & Analytics Routes
  fastify.get('/api/admin/surveys', {
    ...adminOnly,
    schema: { querystring: querySchema({ blockId: text(), panchayatId: text(), villageId: text() }, ['blockId']) }
  }, getAdminSurveys);
  
  fastify.get('/api/admin/gram-stats', {
    ...adminOnly,
    schema: { querystring: emptyQuerySchema }
  }, getAdminGramStats);
  
  fastify.post('/api/admin/query', {
    ...adminOnly,
    schema: { body: adminFilterSchema, querystring: emptyQuerySchema }
  }, queryAdminHouseholds);
  fastify.get('/api/admin/analytics', {
    ...adminOnly,
    schema: { querystring: emptyQuerySchema }
  }, getAnalyticsSummary);
  fastify.get('/api/admin/audit-logs', {
    ...adminOnly,
    schema: {
      querystring: querySchema({
        entityType: { type: 'string', enum: ['household', 'village'] },
        entityId: { type: 'string', minLength: 1, maxLength: 64, pattern: '\\S' },
        limit: { type: 'integer', minimum: 1, maximum: 100 },
        cursor: {
          type: 'string',
          pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
          maxLength: 36
        }
      })
    }
  }, getSurveyAuditLogs);
  fastify.get('/api/admin/export', {
    ...adminOnly,
    schema: {
      querystring: querySchema({
        block: text(), panchayat: text(), village: text(), isBPL: yesNoFilter, caste: text(100), isMiningWorker: yesNoFilter,
        hasMissingDocs: { type: 'string', enum: ['true', 'false'] },
        hasUnemployed: { type: 'string', enum: ['true', 'false'] },
        houseNumber: { type: 'integer', minimum: 1, maximum: 10000000 },
        auditStatus: auditStatusFilter,
        registryStatus: registryStatusFilter,
        searchQuery: { type: 'string', maxLength: 200 }
      })
    }
  }, exportHouseholdsCsv);
}

export default apiRoutes;
