package wnc.auction.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wnc.auction.backend.annotation.RateLimited;
import wnc.auction.backend.dto.request.*;
import wnc.auction.backend.dto.response.ApiResponse;
import wnc.auction.backend.dto.response.AuthResponse;
import wnc.auction.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Authentication and registration endpoints")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    @RateLimited(limit = 5, windowSeconds = 300, keyPrefix = "auth:register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(
                ApiResponse.success("Registration successful. Please check your email to verify your account.", null));
    }

    @PostMapping("/login")
    @Operation(summary = "Login")
    @RateLimited(limit = 10, windowSeconds = 300, keyPrefix = "auth:login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
    }

    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @PostMapping("/resend-verification")
    @Operation(summary = "Resend email verification OTP")
    @RateLimited(limit = 3, windowSeconds = 300, keyPrefix = "auth:resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(@RequestParam String email) {
        authService.sendEmailVerificationOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Verification code sent", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset OTP")
    @RateLimited(limit = 3, windowSeconds = 300, keyPrefix = "auth:forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestParam String email) {
        authService.sendPasswordResetOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset code sent", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with OTP")
    @RateLimited(limit = 5, windowSeconds = 300, keyPrefix = "auth:reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        authService.logout(request.getRefreshToken(), authorizationHeader);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/exchange")
    @Operation(summary = "Exchange authorization code for JWT tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> exchangeToken(@Valid @RequestBody ExchangeTokenRequest request) {
        AuthResponse response = authService.exchangeToken(request.getCode());
        return ResponseEntity.ok(ApiResponse.success("Token exchange successful", response));
    }
}
