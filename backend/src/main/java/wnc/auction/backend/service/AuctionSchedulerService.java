package wnc.auction.backend.service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;
import wnc.auction.backend.scheduler.job.AuctionClosingJob;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionSchedulerService {

    private final Scheduler scheduler;

    public void scheduleAuctionClose(Long productId, LocalDateTime endTime) {
        try {
            JobDetail jobDetail = buildJobDetail(productId);
            Trigger trigger = buildJobTrigger(jobDetail, endTime);

            scheduler.scheduleJob(jobDetail, trigger);
            log.info("Scheduled close job for product {} at {}", productId, endTime);
        } catch (SchedulerException e) {
            log.error("Error scheduling auction close for product {}", productId, e);
        }
    }

    /**
     * Reschedule the job (used for Auto-Extend feature)
     */
    public void rescheduleAuctionClose(Long productId, LocalDateTime newEndTime) {
        try {
            TriggerKey triggerKey = TriggerKey.triggerKey("trigger_" + productId, "auction-triggers");

            // Check if trigger exists
            if (scheduler.checkExists(triggerKey)) {
                Trigger oldTrigger = scheduler.getTrigger(triggerKey);
                TriggerBuilder<?> builder = oldTrigger.getTriggerBuilder();

                Trigger newTrigger = builder.startAt(convertToDate(newEndTime)).build();

                scheduler.rescheduleJob(triggerKey, newTrigger);
                log.info("Rescheduled close job for product {} to {}", productId, newEndTime);
            } else {
                // If job doesn't exist (e.g. server restart without persistence), create new
                scheduleAuctionClose(productId, newEndTime);
            }
        } catch (SchedulerException e) {
            log.error("Error rescheduling auction close for product {}", productId, e);
        }
    }

    private JobDetail buildJobDetail(Long productId) {
        JobDataMap jobDataMap = new JobDataMap();
        jobDataMap.put("productId", productId);

        return JobBuilder.newJob(AuctionClosingJob.class)
                .withIdentity("auction_" + productId, "auction-jobs")
                .withDescription("Close Auction Job")
                .usingJobData(jobDataMap)
                .storeDurably()
                .build();
    }

    private Trigger buildJobTrigger(JobDetail jobDetail, LocalDateTime endTime) {
        return TriggerBuilder.newTrigger()
                .forJob(jobDetail)
                .withIdentity("trigger_" + jobDetail.getKey().getName().substring(8), "auction-triggers")
                .startAt(convertToDate(endTime))
                .withSchedule(SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
                .build();
    }

    private Date convertToDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
}
