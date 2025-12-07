package wnc.auction.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SpringBeanJobFactory;

@Configuration
@RequiredArgsConstructor
public class QuartzConfig {

    @Bean
    public SpringBeanJobFactory springBeanJobFactory() {
        return new AutowiringSpringBeanJobFactory();
    }
}
