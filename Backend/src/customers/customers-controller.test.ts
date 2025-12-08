import app from '../index';
import request from 'supertest';
const db = require('../../models');

jest.mock('../../models');

jest.mock('../middleware/auth-middleware', () => ({
    
}))