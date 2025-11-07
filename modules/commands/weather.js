const axios = require("axios");
const { format, FontSystem } = require('cassidy-styler');

module.exports = {
  config: {
    name: "weather",
    description: "Get current weather for a city",
    usage: "weather <city>",
    cooldown: 10,
    role: 0,
    prefix: true
  },
  run: async (api, event, args, reply, react) => {
    const city = args.join(" ").trim();

    if (!city) {
      const helpMsg = format({
        title: '🌤️ Weather',
        titleFont: 'bold',
        content: `Please provide a city name.\n\n${FontSystem.applyFonts('Example:', 'bold')} ${FontSystem.applyFonts('-weather London', 'typewriter')}`,
        contentFont: 'fancy'
      });
      return reply(helpMsg);
    }

    try {
      await react("⛅");
      
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
      
      if (response.data && response.data.current_condition) {
        const current = response.data.current_condition[0];
        const area = response.data.nearest_area[0];
        
        const temp = current.temp_C;
        const feelsLike = current.FeelsLikeC;
        const condition = current.weatherDesc[0].value;
        const humidity = current.humidity;
        const windSpeed = current.windspeedKmph;
        const location = `${area.areaName[0].value}, ${area.country[0].value}`;
        
        const weatherEmoji = temp > 25 ? '☀️' : temp > 15 ? '⛅' : temp > 5 ? '☁️' : '❄️';
        
        const weatherMessage = format({
          title: `${weatherEmoji} Weather in ${location}`,
          titleFont: 'bold',
          content: `${FontSystem.applyFonts('Condition:', 'bold')} ${FontSystem.applyFonts(condition, 'fancy')}\n\n${FontSystem.applyFonts('Temperature:', 'bold')} ${FontSystem.applyFonts(temp + '°C', 'typewriter')}\n${FontSystem.applyFonts('Feels Like:', 'bold')} ${FontSystem.applyFonts(feelsLike + '°C', 'typewriter')}\n${FontSystem.applyFonts('Humidity:', 'bold')} ${FontSystem.applyFonts(humidity + '%', 'typewriter')}\n${FontSystem.applyFonts('Wind Speed:', 'bold')} ${FontSystem.applyFonts(windSpeed + ' km/h', 'typewriter')}`,
          contentFont: 'none'
        });
        
        reply(weatherMessage);
      }
    } catch (err) {
      console.error("Weather Command Error:", err);
      
      const errorMsg = format({
        title: '❌ Error',
        titleFont: 'bold',
        content: `Could not fetch weather for "${city}". Please check the city name and try again.`,
        contentFont: 'fancy'
      });
      
      reply(errorMsg);
    }
  }
};
