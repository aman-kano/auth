import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from '../../../src/modules/auth/dto';
import { createTestUser, mockRequest } from '../../utils/test-utils';
import { Request } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
    findOrCreateOAuthUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
      };

      const user = await createTestUser(authService['prisma'], {
        email: registerDto.email,
        username: registerDto.username,
      });
      const expectedResponse = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('login', () => {
    it('should login user and return tokens', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const user = await createTestUser(authService['prisma'], {
        email: loginDto.email,
      });
      const expectedResponse = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle MFA required response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
      };

      const expectedResponse = {
        mfaRequired: true,
        userId: 'user-id',
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refresh-token',
      };

      const expectedResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedResponse);

      const result = await controller.refreshToken(refreshTokenDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(refreshTokenDto);
    });
  });

  describe('forgotPassword', () => {
    it('should initiate password reset process', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      const expectedResponse = {
        message: 'If the email exists, a password reset link has been sent',
      };

      mockAuthService.forgotPassword.mockResolvedValue(expectedResponse);

      const result = await controller.forgotPassword(forgotPasswordDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(forgotPasswordDto);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        password: 'newpassword',
      };

      const expectedResponse = {
        message: 'Password has been reset successfully',
      };

      mockAuthService.resetPassword.mockResolvedValue(expectedResponse);

      const result = await controller.resetPassword(resetPasswordDto);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
    });
  });

  describe('googleAuthCallback', () => {
    it('should handle Google OAuth callback', async () => {
      const mockReq = mockRequest({
        email: 'test@example.com',
        name: 'Test User',
        sub: 'google-user-id',
      });

      const user = await createTestUser(authService['prisma'], {
        email: mockReq.user.email,
      });
      const expectedResponse = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.findOrCreateOAuthUser.mockResolvedValue(expectedResponse);

      const result = await controller.googleAuthCallback(mockReq);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.findOrCreateOAuthUser).toHaveBeenCalledWith({
        email: mockReq.user.email,
        username: mockReq.user.name,
        provider: 'google',
        id: mockReq.user.sub,
      });
    });
  });

  describe('githubAuthCallback', () => {
    it('should handle GitHub OAuth callback', async () => {
      const mockReq = mockRequest({
        emails: [{ value: 'test@example.com' }],
        username: 'testuser',
        id: 12345,
      });

      const user = await createTestUser(authService['prisma'], {
        email: mockReq.user.emails[0].value,
      });
      const expectedResponse = {
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockAuthService.findOrCreateOAuthUser.mockResolvedValue(expectedResponse);

      const result = await controller.githubAuthCallback(mockReq);
      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.findOrCreateOAuthUser).toHaveBeenCalledWith({
        email: mockReq.user.emails[0].value,
        username: mockReq.user.username,
        provider: 'github',
        id: mockReq.user.id.toString(),
      });
    });
  });
}); 