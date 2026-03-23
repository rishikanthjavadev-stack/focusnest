package com.focusnest.service;

import com.focusnest.model.User;
import com.focusnest.repository.UserRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JavaMailSender mailSender;

    public PasswordResetService(UserRepository userRepo,
                                PasswordEncoder encoder,
                                JavaMailSender mailSender) {
        this.userRepo   = userRepo;
        this.encoder    = encoder;
        this.mailSender = mailSender;
    }

    public void sendResetEmail(String email) {
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty()) return; // Silent — don't reveal if email exists

        User user  = opt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepo.save(user);

        String link = "http://localhost:3000/reset-password?token=" + token;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(email);
        msg.setSubject("🪺 FocusNest — Reset Your Password");
        msg.setText(
            "Hi " + user.getName() + ",\n\n" +
            "You requested a password reset for your FocusNest account.\n\n" +
            "Click the link below to set a new password (expires in 1 hour):\n\n" +
            link + "\n\n" +
            "If you didn't request this, ignore this email.\n\n" +
            "— The FocusNest Team 🪺"
        );
        mailSender.send(msg);
    }

    public boolean resetPassword(String token, String newPassword) {
        Optional<User> opt = userRepo.findByResetToken(token);
        if (opt.isEmpty()) return false;

        User user = opt.get();
        if (user.getResetTokenExpiry() == null ||
            user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return false; // Expired
        }

        user.setPasswordHash(encoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepo.save(user);
        return true;
    }
}
