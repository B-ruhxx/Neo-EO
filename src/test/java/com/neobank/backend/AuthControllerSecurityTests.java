package com.neobank.backend;

import com.neobank.backend.Auth.AuthController;
import com.neobank.backend.Auth.AuthService;
import com.neobank.backend.Config.SecurityConfig;
import com.neobank.backend.Security.CustomUserDetailService;
import com.neobank.backend.Security.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)

public class AuthControllerSecurityTests {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class MockConfig {
        @Bean
        public AuthService authService() {
            return Mockito.mock(AuthService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public CustomUserDetailService customUserDetailService() {
            return Mockito.mock(CustomUserDetailService.class);
        }

        @Bean
        public com.neobank.backend.Repository.UserRepository userRepository() {
            return Mockito.mock(com.neobank.backend.Repository.UserRepository.class);
        }
    }

    @Test
    @WithMockUser(username = "admin@bank.com", roles = {"ADMIN"})
    void adminEndpoint_withAdminRole_shouldAllowAccess() throws Exception {
        mockMvc.perform(get("/api/auth/admin").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Welcome Admin!"));
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"USER"})
    void adminEndpoint_withUserRole_shouldBeForbidden() throws Exception {
        mockMvc.perform(get("/api/auth/admin").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"USER"})
    void userEndpoint_withUserRole_shouldAllowAccess() throws Exception {
        mockMvc.perform(get("/api/auth/user").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Hello, user!"));
    }




}
