package fr.codecake.ecom.shared.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender emailSender;

    public void sendVerificationCode(String to, String code) {
        try {
            logger.info("Preparing to send verification email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Code de vérification - E-commerce");
            message.setText("Votre code de vérification est : " + code + "\n\nCe code est valable pendant 10 minutes.");
            
            logger.info("Sending verification email to: {}", to);
            emailSender.send(message);
            logger.info("Verification email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Error sending verification email to {}: ", to, e);
            throw e;
        }
    }
} 