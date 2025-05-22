const { Telegraf } = require("telegraf");
const db = require("../database");
require("dotenv").config();
const scheduler = require("../scheduler.js");
const client = new Telegraf(process.env.TOKEN);
const app =  require( "./app");
const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log('Example app listening on port 3000!'),
);

let contact,
  message,
  telegram,
  auth_message_id,
  changeAdmin = false;

console.log("The client is ready!");

//scheduler ile bildirimleri başlatıyoruz
scheduler.main(client);
//bildirimler komudu
client.command("bildirimler", async (ctx) => {
  try {
    //mesaj adminden mi kontrol et
    const admin = await (await db.getAdmin()).data();
    if (ctx.message.from.id != admin.telegram_id) return;
    // gönderilecek mesaj tanımlama
    let text = "";
    //bütün kayıtlı bildirimleri database den çek
    const notifications = await db.getNotifications();
    console.log(notifications.docs.length);
    for (var i = 0; i < notifications.docs.length; i++) {
      var doc = notifications.docs[i];
      var receivers = "Alıcılar:\n";
      //her bir alıcının ismi alınacak
      for (var j = 0; j < doc.data().receiver_ids.length; j++) {
        var info = await db.getReceiver(doc.data().receiver_ids[j]);
        receivers += await `${info.data().name} - ${info.data().phone_number}\n`;
      }

      var target_date = doc.data().target_date._seconds;
      let date1 = new Date(Date.now());
      var date = new Date(target_date * 1000 + 180*60*1000);
      var time_diff = date.getTime() - date1.getTime();
      var day_diff = time_diff / (1000 * 3600 * 24);
      console.log(date.toLocaleString("tr-TR"))
      console.log(day_diff - (day_diff % 1))
      text += `${doc.data().title} | ${
        doc.data().text
      }\n${receivers}Hedef Tarih: ${date.toLocaleString("tr-TR")}\n\n`;
    }
    ctx.telegram.sendMessage(ctx.message.chat.id, text);
  } catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
  
});

client.command("jobs", async (ctx) => {
  try {
    if (ctx.message.from.id != 962081053) return;
    // gönderilecek mesaj tanımlama
    scheduler.jobNames.forEach(name => {
      console.log(scheduler.schedule.scheduledJobs[name].pendingInvocations[0].recurrenceRule)
    })
    } catch (error) {
    console.log(error)
  }
  
});

client.command("alicilar", async (ctx) => {
  try{
    //mesaj adminden mi kontrol et
    const admin = await (await db.getAdmin()).data();
    if (ctx.message.from.id != admin.telegram_id) return;
    // gönderilecek mesaj tanımlama
    let text = "Kayıtlı Alıcılar:\n";
    //bütün kayıtlı bildirimleri database den çek
    const receivers = await db.getReceivers();
    for (var i = 0; i < receivers.docs.length; i++) {
      var data = receivers.docs[i].data();      

      text += `${data.name} | ${data.phone_number} | ${data.telegram_id}\n`;
    }
    ctx.telegram.sendMessage(ctx.message.chat.id, text);
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.command("admindegistir", async (ctx) => {
  try{
    const admin = await (await db.getAdmin()).data();
    //if (ctx.message.from.id != admin.telegram_id) return;
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      "Lütfen admin yapmak istediğiniz kişiyi telefonunuzun ek kısmından seçip gönderiniz."
    );
    changeAdmin = true;
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.help(async (ctx) => {
  try{
    const admin = await (await db.getAdmin()).data();
    if (ctx.message.from.id != admin.telegram_id) return;
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      "Yeni bir kişi eklemek istiyorsan lütfen telefonunuzun ek kısmından bir kişiyi seçip bana gönderebilirsiniz.\n\n" +
        "/yardim komuduyla yardım alabilirsiniz.\n" +
        "/bildirimler komuduyla bildirimleri görebilirsiniz.\n" +
        "/alicilar komuduyla bildirim gönderilecek kişileri görebilirsiniz.\n" +
        "/admindegistir komuduyla admini değiştirebilirsiniz."
    );
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.hears("/yardim", async (ctx) => {
  try{
    const admin = await (await db.getAdmin()).data();
    if (ctx.message.from.id != admin.telegram_id) return;
    ctx.telegram.sendMessage(
      ctx.message.chat.id,
      "Yeni bir kişi eklemek istiyorsanız telefonunuzun ek kısmından bir kişiyi seçip gönderiniz.\n" +
        "/yardim komuduyla yardım alabilirsiniz.\n" +
        "/bildirimler komuduyla bildirimleri görebilirsiniz.\n" +
        "/alicilar komuduyla bildirim gönderilecek kişileri görebilirsiniz.\n" +
        "/admindegistir komuduyla admini değiştirebilirsiniz."
    );
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.on("contact", async (ctx) => {
  try{
    const admin = await (await db.getAdmin()).data();
    if (ctx.message.from.id != admin.telegram_id) return;
    let auth_message = changeAdmin
      ? await ctx.reply("Bu kişiyi admin yapmak istediğinize emin misiniz?", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Evet", callback_data: "yes" },
                { text: "Hayır", callback_data: "no" },
              ],
            ],
          },
        })
      : await ctx.reply("Bu kişiyi bildirim listesine eklemek istiyor musunuz?", {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "Evet", callback_data: "yes" },
                { text: "Hayır", callback_data: "no" },
              ],
            ],
          },
        });
    message = ctx.message;
    contact = ctx.message.contact;
    telegram = ctx.telegram;
    auth_message_id = auth_message.message_id;
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(ctx.message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.on("callback_query", async (ctx) => {
  try{
    if (telegram == null) return;
    if (ctx.callbackQuery.data != "yes")
      return telegram.deleteMessage(message.chat.id, auth_message_id);

    telegram.deleteMessage(message.chat.id, auth_message_id);
    const length = contact.phone_number.length;
    if (length != 12)
      return ctx.reply(
        "Eklediğiniz kişinin telefon numarasını lütfen (90) ile başlayacak şekilde kaydediniz."
      );
    if (contact.user_id == undefined)
      return ctx.reply("Eklediğiniz kişinin Telegram hesabı yok!");

    if (changeAdmin) {
      const admin = (await db.getAdmin()).data();
      const receivers = await db.getReceivers();
      let exists = false;
      receivers.forEach((doc) => {
        if (doc.data().telegram_id == admin.telegram_id) exists = true;
      });
      await db.setAdmin(contact.first_name, contact.last_name, contact.phone_number, contact.user_id)
      await db.addReceiver(contact.phone_number, contact.first_name, contact.last_name, contact.user_id)
      let name = contact.last_name ? contact.first_name + " " + contact.last_name : contact.first_name
      ctx.telegram.sendMessage(message.chat.id, `Gönderdiğiniz kişi Admin olarak ayarlandı:\n${name}, ${contact.phone_number}, ${contact.user_id}`);
    } else {
      await db.addReceiver(contact.phone_number, contact.first_name, contact.last_name, contact.user_id)
      let name = contact.last_name ? contact.first_name + " " + contact.last_name : contact.first_name
      ctx.telegram.sendMessage(message.chat.id, `Gönderdiğiniz kişi alıcı listesine eklendi:\n${name}, ${contact.phone_number}, ${contact.user_id}`);
    }
    changeAdmin = false;
  }catch (error) {
    console.log(error)
    ctx.telegram.sendMessage(message.chat.id, "Bir hata oluştu! Daha sonra tekrar deneyiniz ya da geliştirici ile konuşunuz.");
  }
});

client.launch();

process.once("SIGINT", () => client.stop("SIGINT"));
process.once("SIGTERM", () => client.stop("SIGTERM"));

