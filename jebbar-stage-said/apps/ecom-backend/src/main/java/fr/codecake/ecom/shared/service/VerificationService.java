package fr.codecake.ecom.shared.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {
    private static final Logger logger = LoggerFactory.getLogger(VerificationService.class);

    @Autowired
    private EmailService emailService;

    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public void sendVerificationCode(String email) {
        try {
            logger.info("Generating verification code for email: {}", email);
            String code = generateVerificationCode();
            LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(10);
            
            verificationCodes.put(email, new VerificationCode(code, expiryTime));
            logger.info("Stored verification code for email: {}", email);
            
            emailService.sendVerificationCode(email, code);
            logger.info("Verification code sent to email: {}", email);
        } catch (Exception e) {
            logger.error("Error in sendVerificationCode for email {}: ", email, e);
            throw e;
        }
    }

    public boolean verifyCode(String email, String code) {
        try {
            logger.info("Verifying code for email: {}", email);
            VerificationCode storedCode = verificationCodes.get(email);
            if (storedCode == null) {
                logger.warn("No verification code found for email: {}", email);
                return false;
            }

            if (LocalDateTime.now().isAfter(storedCode.expiryTime)) {
                logger.warn("Verification code expired for email: {}", email);
                verificationCodes.remove(email);
                return false;
            }

            boolean isValid = storedCode.code.equals(code);
            if (isValid) {
                logger.info("Code verified successfully for email: {}", email);
                verificationCodes.remove(email);
            } else {
                logger.warn("Invalid code provided for email: {}", email);
            }
            return isValid;
        } catch (Exception e) {
            logger.error("Error verifying code for email {}: ", email, e);
            throw e;
        }
    }

    private String generateVerificationCode() {
        String code = String.format("%06d", random.nextInt(1000000));
        logger.debug("Generated verification code: {}", code);
        return code;
    }

    private static class VerificationCode {
        final String code;
        final LocalDateTime expiryTime;

        VerificationCode(String code, LocalDateTime expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }
} 