package fr.codecake.ecom.shared.security;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
} 
