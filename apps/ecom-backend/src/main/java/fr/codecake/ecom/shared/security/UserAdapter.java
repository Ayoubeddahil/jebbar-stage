package fr.codecake.ecom.shared.security;

import fr.codecake.ecom.order.domain.user.aggregate.Authority;
import fr.codecake.ecom.order.domain.user.aggregate.AuthorityBuilder;
import fr.codecake.ecom.order.domain.user.aggregate.User;
import fr.codecake.ecom.order.domain.user.aggregate.UserBuilder;
import fr.codecake.ecom.order.domain.user.vo.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter class to convert between Spring Security User and Order Domain User
 */
public class UserAdapter {

    /**
     * Converts a Spring Security User to an Order Domain User
     * @param securityUser the Spring Security User
     * @return the Order Domain User
     */
    public static User toOrderDomainUser(fr.codecake.ecom.shared.security.User securityUser) {
        if (securityUser == null) {
            return null;
        }

        UserBuilder userBuilder = UserBuilder.user();
        
        // Map basic fields
        userBuilder.email(new UserEmail(securityUser.getEmail()));
        
        // Extract first and last name from username if available
        String username = securityUser.getUsername();
        if (username != null && username.contains(" ")) {
            String[] nameParts = username.split(" ", 2);
            userBuilder.firstname(new UserFirstname(nameParts[0]));
            userBuilder.lastname(new UserLastname(nameParts[1]));
        } else {
            // Default to username for both if no space found
            userBuilder.firstname(new UserFirstname(username != null ? username : ""));
            userBuilder.lastname(new UserLastname(""));
        }
        
        // Map authorities/roles
        Set<Authority> authorities = new HashSet<>();
        if (securityUser.getRoles() != null) {
            authorities = securityUser.getRoles().stream()
                .map(role -> AuthorityBuilder.authority()
                    .name(new AuthorityName(role))
                    .build())
                .collect(Collectors.toSet());
        }
        userBuilder.authorities(authorities);
        
        // Set database ID
        userBuilder.dbId(securityUser.getId());
        
        // Generate a UUID for public ID if needed
        userBuilder.userPublicId(new UserPublicId(UUID.randomUUID()));
        
        return userBuilder.build();
    }
    
    /**
     * Creates a UserPublicId from a Spring Security User
     * @param securityUser the Spring Security User
     * @return a UserPublicId based on the user's ID
     */
    public static UserPublicId getUserPublicId(fr.codecake.ecom.shared.security.User securityUser) {
        if (securityUser == null) {
            return null;
        }
        
        // Create a deterministic UUID based on the user's ID
        UUID uuid = UUID.nameUUIDFromBytes(("user-" + securityUser.getId()).getBytes());
        return new UserPublicId(uuid);
    }
}
