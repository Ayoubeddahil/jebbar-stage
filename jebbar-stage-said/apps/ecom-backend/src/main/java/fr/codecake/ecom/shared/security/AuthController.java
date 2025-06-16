package fr.codecake.ecom.shared.security;

import fr.codecake.ecom.shared.service.VerificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;
    private final VerificationService verificationService;

    public AuthController(AuthService authService, VerificationService verificationService) {
        this.authService = authService;
        this.verificationService = verificationService;
    }

    @PostMapping("/send-verification")
    public ResponseEntity<?> sendVerificationCode(@Valid @RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            logger.info("Attempting to send verification code to email: {}", email);
            
            verificationService.sendVerificationCode(email);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Verification code sent successfully!");
            logger.info("Verification code sent successfully to: {}", email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error sending verification code: ", e);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to send verification code: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        String jwt = authService.authenticateUser(loginRequest.getUsername(), loginRequest.getPassword());
        
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        // Vérifier le code de vérification
        if (!verificationService.verifyCode(signupRequest.getEmail(), signupRequest.getVerificationCode())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid or expired verification code!");
            return ResponseEntity.badRequest().body(response);
        }

        String token = authService.registerAndAuthenticateUser(
            signupRequest.getUsername(),
            signupRequest.getEmail(),
            signupRequest.getPassword()
        );

        Map<String,String> response = new HashMap<>();
        response.put("message", "User registered and logged in successfully!");
        response.put("token", token);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user-roles")
    public ResponseEntity<?> getUserRoles() {
        return ResponseEntity.ok(authService.getCurrentUserRoles());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }

    @PostMapping("/update-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        Map<String, String> response = authService.updatePassword(request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(response);
    }
} 
