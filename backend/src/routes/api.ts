import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { login } from '../controllers/authController';
import { getAllVillageProfiles, getVillageProfile, saveVillageProfile, patchVillageProfile, deleteVillageProfile } from '../controllers/villageController';
import { getHouseholdSurveys, saveHouseholdSurvey, patchHouseholdSurvey, deleteHouseholdSurvey } from '../controllers/householdController';
import { queryAdminHouseholds, getAnalyticsSummary } from '../controllers/adminController';
import { getHierarchy } from '../controllers/hierarchyController';

export async function apiRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  
  fastify.addHook('onSend', async (req, reply) => {
    reply.header('Keep-Alive', 'timeout=5, max=1000');
    reply.header('X-Content-Type-Options', 'nosniff');
  });

  // 1. Auth & Location Hierarchy Routes
  fastify.post('/api/auth/login', login);
  fastify.get('/api/hierarchy', getHierarchy);

  // 2. Village Profile Routes
  fastify.get('/api/villages/all', getAllVillageProfiles);
  fastify.get('/api/villages/profile', getVillageProfile);
  fastify.post('/api/villages/profile', saveVillageProfile);
  fastify.patch('/api/villages/:id', patchVillageProfile);
  fastify.delete('/api/villages/:id', deleteVillageProfile);

  // 3. Household Survey Routes
  fastify.get('/api/households', getHouseholdSurveys);
  fastify.post('/api/households', saveHouseholdSurvey);
  fastify.patch('/api/households/:id', patchHouseholdSurvey);
  fastify.delete('/api/households/:id', deleteHouseholdSurvey);

  // 4. Admin Dynamic Query & Analytics Routes
  fastify.post('/api/admin/query', queryAdminHouseholds);
  fastify.get('/api/admin/analytics', getAnalyticsSummary);
}

export default apiRoutes;
