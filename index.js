const { Telegraf } = require('telegraf')
const { CronJob } = require('cron');
const fetch = require('node-fetch');

const bot = new Telegraf(process.env.TOKEN);

const RND = (min, max) => Math.random() * (max - min) + min;

const ChatID = process.env.ChatID;
const tryCount = 10;

const tags = [
  'memes',
  'funny',
  'meme',
];

const send = async (link) => {
  bot.telegram.sendPhoto(ChatID, link, {
    caption: ' <a href="https://t.me/tab_mk">Sub</a> 👈',
    parse_mode: 'HTML'
  }).catch(e => {
    console.log(e);
  });
}

const getLink = async () => {
  const tag = tags[RND(0, tags.length-1)];

  let res = await fetch(`https://www.reddit.com/r/${tag}/new.json?limit=40`);
  res = await res.json();

  if (typeof res.data === 'undefined') {
    return false;
  }

  let { children } = res.data;
  let urls = children.map((e) => {
    if (/\.jpg|\.png/.test(e.data.url)) {
      return e.data.url;
    }
  }).filter($ => $);

  return urls[Math.floor(RND(0, urls.length))];
}

const getNsend =  async () => {
  let i = 0;

  while (true) {
    i += 1;

    let link = await getLink();

    if (link) {
      send(link);
      break;
    }

    if (i === tryCount) {
      console.log(`${tryCount} fails`);
      break;
    }
  }
}

bot.command('/post', getNsend)

new CronJob('00 10 * * *', getNsend).start();
new CronJob('00 15 * * *', getNsend).start();
new CronJob('00 20 * * *', getNsend).start();

bot.launch();
