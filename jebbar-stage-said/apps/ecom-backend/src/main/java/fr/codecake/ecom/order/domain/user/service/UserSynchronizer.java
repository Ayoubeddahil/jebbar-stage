package fr.codecake.ecom.order.domain.user.service;

import fr.codecake.ecom.order.domain.user.repository.UserRepository;
import fr.codecake.ecom.order.domain.user.aggregate.User;
import fr.codecake.ecom.order.domain.user.aggregate.UserBuilder;
import fr.codecake.ecom.order.domain.user.vo.UserEmail;
import fr.codecake.ecom.order.domain.user.vo.UserAddressToUpdate;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class UserSynchronizer {
  private final UserRepository userRepository;

    public UserSynchronizer(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

    public void synchronizeUser(String email) {
        UserEmail userEmail = new UserEmail(email);
        if (!userRepository.getOneByEmail(userEmail).isPresent()) {
            User user = UserBuilder.user()
                .email(userEmail)
                .authorities(new HashSet<>())
                .build();
      user.initFieldForSignup();
      userRepository.save(user);
    }
  }

    public void syncWithIdp(Jwt jwtToken, boolean forceResync) {
        String email = jwtToken.getSubject();
        if (forceResync || !userRepository.getOneByEmail(new UserEmail(email)).isPresent()) {
            synchronizeUser(email);
        }
  }

  public void updateAddress(UserAddressToUpdate userAddressToUpdate) {
    userRepository.updateAddress(userAddressToUpdate.userPublicId(), userAddressToUpdate);
  }
}
