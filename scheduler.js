const schedule = require("node-schedule");
const {
  getNotifications,
  getReceivers,
  getReceiver,
  admin,
} = require("./database.js");

var jobNames = []
async function main(client) {
  try {
    let detectChanges = false;

    admin
      .firestore()
      .collection("notifications")
      .onSnapshot((querySnapshot) => {
        querySnapshot.docChanges().forEach((change) => {
          const data = change.doc.data();
          if (change.type === "added") {
            if (!detectChanges) return;
            scheduleJob(client, "added", data, change.doc.id);
          }
          if (change.type === "modified") {
            if (!detectChanges) return;
            scheduleJob(client, "modified", data, change.doc.id);
          }
          if (change.type === "removed") {
            if (!detectChanges) return;
            cancelJob(data, change.doc.id);
          }
        });
      });

    const notifications = await getNotifications();
    const docs = notifications.docs;

    for (var i = 0; i < docs.length; i++) {
      const data = docs[i].data();
      scheduleJob(client, "added", data, docs[i].id);
      for (var l = 0; l < data.reminder_times.length; l++) {
        var jobName = docs[i].id + "-" + data.reminder_times[l];
        jobNames.push(jobName)
      }
    }
    console.log(schedule.scheduledJobs)
    detectChanges = true;
  } catch (err) {
    console.log(err);
  }
};

// ? Bu fonksiyon bir bildirim kaydetmek için
async function scheduleJob(client, type, data, id) {
  try{
    for (var i = 0; i < data.reminder_times.length; i++) {
      if (type == "modified") {
        var jobName = id + "-" + data.reminder_times[i];
        let job = schedule.scheduledJobs[jobName];
        if(job)
          job.cancel();
      }

      var time = data.reminder_times[i].toString().split(":"); //database den gelen string türündeki saat ve dakikayı ayırıyoruz
      let hour = parseInt(time[0]),
        minute = parseInt(time[1]);

      var start_date = data.start_date;
      var startdate = new Date(start_date * 1000); //kodun anlayacağı tarih türüne çeviriyoruz

      var reminder_days = [];
      for (var k = 0; k < data.reminder_days.length; k++) {
        var day = parseInt(data.reminder_days[k]);
        if (1 <= day <= 7) reminder_days.push(day);
      }

      let rule = {
        start: startdate,
        hour,
        minute,
        dayOfWeek: reminder_days,
        tz: "Turkey"
      };
      //bildirimi yeniden ekliyoruz
      console.log(data.reminder_times[i])
      schedule.scheduleJob(
        id + "-" + data.reminder_times[i],
        rule,
        async function () {
          for (var l = 0; l < data.receiver_ids.length; l++) {
            console.log(data.receiver_ids.toString())
            console.log("message is being sent to ", data.receiver_ids[l])
            let date = new Date(Date.now());
            let date1 = new Date(data.target_date._seconds*1000+180*60*1000)
            var time_diff = date1.getTime() - date.getTime();
            var day_diff = time_diff / (1000 * 3600 * 24);

            await client.telegram.sendMessage(
              data.receiver_ids[l],
              `${data.title}\n${data.text}\nKalan Süre: ${
                day_diff - (day_diff % 1)
               } Gün`
            );
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

async function cancelJob(data, id) {
  for (var i = 0; i < data.reminder_times.length; i++) {
    
    var jobName = id + "-" + data.reminder_times[i];
    let job = schedule.scheduledJobs[jobName];
    job.cancel();

  }
}

module.exports = {
  main,
  schedule,
  jobNames
}