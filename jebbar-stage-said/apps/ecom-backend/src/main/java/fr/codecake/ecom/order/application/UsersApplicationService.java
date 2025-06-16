package fr.codecake.ecom.order.application;

import fr.codecake.ecom.order.domain.user.aggregate.User;
import fr.codecake.ecom.order.domain.user.repository.UserRepository;
import fr.codecake.ecom.order.domain.user.service.UserReader;
import fr.codecake.ecom.order.domain.user.service.UserSynchronizer;
import fr.codecake.ecom.order.domain.user.vo.UserAddressToUpdate;
import fr.codecake.ecom.order.domain.user.vo.UserEmail;
import fr.codecake.ecom.shared.authentication.application.AuthenticatedUser;
import fr.codecake.ecom.shared.security.UserAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsersApplicationService {
  private static final Logger log = LoggerFactory.getLogger(UsersApplicationService.class);

  private final UserSynchronizer userSynchronizer;
  private final UserReader userReader;
  
  @Autowired
  private fr.codecake.ecom.shared.security.UserRepository securityUserRepository;

  public UsersApplicationService(UserRepository userRepository) {
    this.userSynchronizer = new UserSynchronizer(userRepository);
    this.userReader = new UserReader(userRepository);
  }

  @Transactional
  public User getAuthenticatedUserWithSync(Jwt jwtToken, boolean forceResync) {
    log.debug("Syncing user with JWT token: {}", jwtToken != null ? "token present" : "token missing");
    userSynchronizer.syncWithIdp(jwtToken, forceResync);
    return userReader.getByEmail(new UserEmail(AuthenticatedUser.username().get()))
      .orElseThrow();
  }

  @Transactional(readOnly = true)
  public User getAuthenticatedUser() {
    log.debug("Getting authenticated user");
    try {
      // Get the current authenticated user from Spring Security context
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication == null) {
        log.error("No authentication found in security context");
        throw new RuntimeException("No authentication found in security context");
      }
      
      String username = authentication.getName();
      log.debug("Found authenticated user: {}", username);
      
      // Try to find the user in the security repository
      fr.codecake.ecom.shared.security.User securityUser = securityUserRepository.findByUsername(username)
          .orElseThrow(() -> {
              log.error("User not found in security repository: {}", username);
              return new RuntimeException("User not found in security repository");
          });
      
      // Convert the security user to domain user using the adapter
      return UserAdapter.toOrderDomainUser(securityUser);
      
    } catch (Exception e) {
      log.error("Error getting authenticated user", e);
      throw e;
    }
  }

  @Transactional
  public void updateAddress(UserAddressToUpdate userAddressToUpdate) {
    userSynchronizer.updateAddress(userAddressToUpdate);
  }

  public void synchronizeUser(String username) {
    userSynchronizer.synchronizeUser(username);
  }
}
