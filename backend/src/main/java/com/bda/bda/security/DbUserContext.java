package com.bda.bda.security;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DbUserContext {
    private final EntityManager entityManager;

    public void propagate() {
        String username = resolveUsername();
        entityManager.createNativeQuery(
                "SELECT set_config('app.current_user', :u, true)"
        ).setParameter("u", username).getSingleResult();
    }

    private String resolveUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && !"anonymousUser".equals(auth.getPrincipal())) {
            return auth.getName();
        }
        return "anonymous";
    }
}