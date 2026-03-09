package com.focusnest.security;

import com.focusnest.model.User;
import com.focusnest.repository.UserRepository;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import java.io.IOException;

@Component
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepo;
    private final JwtTokenProvider jwt;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public OAuth2SuccessHandler(UserRepository userRepo, JwtTokenProvider jwt) {
        this.userRepo = userRepo;
        this.jwt      = jwt;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                        Authentication auth) throws IOException {
        OAuth2User oauthUser = (OAuth2User) auth.getPrincipal();
        String email   = oauthUser.getAttribute("email");
        String name    = oauthUser.getAttribute("name");
        String picture = oauthUser.getAttribute("picture");
        if (name == null) name = oauthUser.getAttribute("login");

        String providerStr = oauthUser.getAttribute("sub") != null ? "GOOGLE" : "GITHUB";
        User.AuthProvider provider = User.AuthProvider.valueOf(providerStr);
        final String finalName = name;

        User user = userRepo.findByEmail(email).orElseGet(() ->
            User.builder().email(email).name(finalName)
                .avatarUrl(picture).authProvider(provider)
                .onboardingDone(false).build());

        if (user.getAvatarUrl() == null) user.setAvatarUrl(picture);
        userRepo.save(user);

        String access  = jwt.generateAccessToken(email);
        String refresh = jwt.generateRefreshToken(email);
        String path    = Boolean.TRUE.equals(user.getOnboardingDone()) ? "/dashboard" : "/onboarding";

        String url = UriComponentsBuilder.fromUriString(frontendUrl + path)
            .queryParam("token", access)
            .queryParam("refresh", refresh)
            .build().toUriString();

        getRedirectStrategy().sendRedirect(req, res, url);
    }
}
