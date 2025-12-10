package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;
import wnc.auction.backend.scheduler.job.SellerRoleExpirationJob;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserSchedulerService {

    private final Scheduler scheduler;

    public void scheduleSellerExpiration(Long userId, LocalDateTime expirationTime) {
        try {
            JobDetail jobDetail = buildJobDetail(userId);
            Trigger trigger = buildJobTrigger(jobDetail, expirationTime);

            // Check if job exists and replace it (in case of re-approval/extension)
            if (scheduler.checkExists(jobDetail.getKey())) {
                scheduler.deleteJob(jobDetail.getKey());
            }

            scheduler.scheduleJob(jobDetail, trigger);
            log.info("Scheduled seller expiration for user {} at {}", userId, expirationTime);
        } catch (SchedulerException e) {
            log.error("Error scheduling seller expiration for user {}", userId, e);
        }
    }

    private JobDetail buildJobDetail(Long userId) {
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put("userId", userId);

        return JobBuilder.newJob(SellerRoleExpirationJob.class)
                .withIdentity("seller_expire_" + userId, "user-jobs")
                .withDescription("Downgrade Seller to Bidder")
                .usingJobData(jobDataMap)
                .storeDurably()
                .build();
    }

    private Trigger buildJobTrigger(JobDetail jobDetail, LocalDateTime executeAt) {
        return TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withIdentity(
                        "trigger_seller_expire_" + jobDetail.getKey().getName().substring(14), "user-triggers")
                .startAt(Date.from(executeAt.atZone(ZoneId.systemDefault()).toInstant()))
                .withSchedule(SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
                .build();
    }
}
