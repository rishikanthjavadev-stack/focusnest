package com.focusnest.security;

import com.focusnest.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepo;

    public UserDetailsServiceImpl(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepo.findByEmail(email).map(u -> new org.springframework.security.core.userdetails.User(
            u.getEmail(),
            u.getPasswordHash() != null ? u.getPasswordHash() : "{noop}oauth2user",
            List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole().name()))
        )).orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
}
