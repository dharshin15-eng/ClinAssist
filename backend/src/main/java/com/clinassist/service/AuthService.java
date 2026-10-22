package com.clinassist.service;

import com.clinassist.dto.AuthResponseDto;
import com.clinassist.dto.LoginRequestDto;
import com.clinassist.dto.RegisterRequestDto;
import com.clinassist.dto.UserResponseDto;
import com.clinassist.entity.Role;
import com.clinassist.entity.User;
import com.clinassist.exception.InvalidCredentialsException;
import com.clinassist.exception.UnauthorizedRoleAssignmentException;
import com.clinassist.exception.UserAlreadyExistsException;
import com.clinassist.repository.UserRepository;
import com.clinassist.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service handling user registration, authentication, password hashing, and token generation.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponseDto register(RegisterRequestDto dto) {
        if (dto.getRole() == Role.ADMIN) {
            throw new UnauthorizedRoleAssignmentException("ADMIN role cannot be self-assigned via public registration");
        }

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered: " + dto.getEmail());
        }

        User user = new User(
                dto.getEmail(),
                passwordEncoder.encode(dto.getPassword()),
                dto.getFullName(),
                dto.getRole()
        );

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponseDto(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole());
    }

    public AuthResponseDto login(LoginRequestDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!user.isEnabled()) {
            throw new org.springframework.security.authentication.DisabledException("User account is disabled");
        }

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponseDto(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public UserResponseDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("User profile not found for email: " + email));

        return new UserResponseDto(user);
    }
}
