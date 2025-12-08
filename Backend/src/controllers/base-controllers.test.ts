import { Response } from 'express';
import { BaseController } from './base-controllers';
import { AuthRequest } from '../middleware/auth-middleware';

// Create a concrete implementation for testing
class TestController extends BaseController {
  // Expose protected methods for testing
  public testHandleError(res: Response, error: any, message: string) {
    return this.handleError(res, error, message);
  }

  public testCheckOwnership(req: AuthRequest, resourceUserId: number, resourceType?: string) {
    return this.checkOwnership(req, resourceUserId, resourceType);
  }

  public testUnauthorizedResponse(res: Response, message?: string) {
    return this.unauthorizedResponse(res, message);
  }
}

// Mock response object
const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('BaseController', () => {
  let testController: TestController;
  let mockResponse: Response;

  beforeEach(() => {
    testController = new TestController();
    mockResponse = createMockResponse();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    it('should handle SequelizeUniqueConstraintError with 400 status', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        message: 'Duplicate entry'
      };
      const customMessage = 'Custom error message';

      testController.testHandleError(mockResponse, error, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Username or email already exists'
      });
    });

    it('should handle generic errors with 500 status', () => {
      const error = {
        name: 'GenericError',
        message: 'Something went wrong'
      };
      const customMessage = 'Custom error message';

      testController.testHandleError(mockResponse, error, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: customMessage,
        error: error.message
      });
    });

    it('should handle errors without name property', () => {
      const error = {
        message: 'Some error occurred'
      };
      const customMessage = 'Error occurred';

      testController.testHandleError(mockResponse, error, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: customMessage,
        error: error.message
      });
    });

    it('should handle string errors', () => {
      const error = 'String error message';
      const customMessage = 'Error occurred';

      testController.testHandleError(mockResponse, error, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: customMessage,
        error: error
      });
    });

    it('should handle null/undefined errors', () => {
      const customMessage = 'Error occurred';

      testController.testHandleError(mockResponse, null, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: customMessage,
        error: 'null'
      });
    });
  });

  describe('checkOwnership', () => {
    it('should return true when user owns resource and types match', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, 'customer');

      expect(result).toBe(true);
    });

    it('should return true when user owns resource and no resource type specified', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1);

      expect(result).toBe(true);
    });

    it('should return false when user does not own resource', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 2, 'customer');

      expect(result).toBe(false);
    });

    it('should return false when user type does not match resource type', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, 'dealer');

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      const req = {
        user: null
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, 'customer');

      expect(result).toBe(false);
    });

    it('should return false when user object is missing', () => {
      const req = {} as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, 'customer');

      expect(result).toBe(false);
    });

    it('should handle different user types', () => {
      const userTypes = ['customer', 'dealer', 'admin', 'shipper'];
      
      userTypes.forEach(type => {
        const req = {
          user: {
            id: 1,
            type
          }
        } as AuthRequest;

        const result = testController.testCheckOwnership(req, 1, type);
        expect(result).toBe(true);
      });
    });

    it('should handle numeric user IDs', () => {
      const req = {
        user: {
          id: 123,
          type: 'customer'
        }
      } as AuthRequest;

      // Test with same numeric ID
      expect(testController.testCheckOwnership(req, 123, 'customer')).toBe(true);
      
      // Test with different numeric ID
      expect(testController.testCheckOwnership(req, 456, 'customer')).toBe(false);
    });

    it('should handle string user IDs that can be parsed as numbers', () => {
      const req = {
        user: {
          id: 123, // string ID
          type: 'customer'
        }
      } as AuthRequest;

      // This will return false because '123' !== 123
      expect(testController.testCheckOwnership(req, 123, 'customer')).toBe(false);
    });
  });

  describe('unauthorizedResponse', () => {
    it('should return 403 with default message', () => {
      testController.testUnauthorizedResponse(mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Access denied'
      });
    });

    it('should return 403 with custom message', () => {
      const customMessage = 'You do not have permission to access this resource';

      testController.testUnauthorizedResponse(mockResponse, customMessage);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: customMessage
      });
    });

    it('should chain status and json calls correctly', () => {
      testController.testUnauthorizedResponse(mockResponse, 'Custom message');

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Custom message'
      });
      expect(mockResponse.status(403).json).toHaveBeenCalledWith({
        message: 'Custom message'
      });
    });
  });

  describe('Integration: Using all methods together', () => {
    it('should properly chain ownership check and error handling', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      // Test ownership check
      const hasAccess = testController.testCheckOwnership(req, 1, 'customer');
      expect(hasAccess).toBe(true);

      // Test unauthorized response
      testController.testUnauthorizedResponse(mockResponse, 'No access');
      expect(mockResponse.status).toHaveBeenCalledWith(403);

      // Test error handling
      const error = { name: 'SequelizeUniqueConstraintError', message: 'Duplicate' };
      testController.testHandleError(mockResponse, error, 'Error');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should simulate a real-world scenario: update user profile', () => {
      const userId = 5;
      const req = {
        params: { id: '5' },
        user: {
          id: userId,
          type: 'customer'
        }
      } as any as AuthRequest;

      // Check if user can access resource
      const canAccess = testController.testCheckOwnership(req, userId, 'customer');
      
      if (!canAccess) {
        testController.testUnauthorizedResponse(mockResponse, 'Cannot update another user profile');
        expect(mockResponse.status).toHaveBeenCalledWith(403);
      } else {
        // Simulate successful operation
        expect(canAccess).toBe(true);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined resource type', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, undefined as any);
      expect(result).toBe(true);
    });

    it('should handle empty string resource type', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, '');
      expect(result).toBe(false); // '' !== 'customer'
    });

    it('should handle null resource type', () => {
      const req = {
        user: {
          id: 1,
          type: 'customer'
        }
      } as AuthRequest;

      const result = testController.testCheckOwnership(req, 1, null as any);
      expect(result).toBe(true); // null is treated as undefined
    });

    it('should handle response methods being called multiple times', () => {
      const error = { name: 'TestError', message: 'Error 1' };
      
      // Call handleError multiple times
      testController.testHandleError(mockResponse, error, 'First error');
      testController.testHandleError(mockResponse, error, 'Second error');
      
      expect(mockResponse.status).toHaveBeenCalledTimes(2);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });
  });
});
