const axios = require('axios');

const languageMap = {
  javascript: { script: 'nodejs', versionIndex: '4' },
  python: { script: 'python3', versionIndex: '4' },
  java: { script: 'java', versionIndex: '4' },
  cpp: { script: 'cpp17', versionIndex: '1' },
  c: { script: 'c', versionIndex: '5' },
};

exports.executeCode = async (req, res) => {
  try {
    const { script, language } = req.body;

    if (!script || !language) {
      return res.status(400).json({ error: 'Script and language are required' });
    }

    const config = languageMap[language.toLowerCase()];
    if (!config) {
      return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const payload = {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: script,
      language: config.script,
      versionIndex: config.versionIndex,
    };

    const response = await axios.post('https://api.jdoodle.com/v1/execute', payload);

    return res.status(200).json({
      output: response.data.output,
      statusCode: response.data.statusCode,
      memory: response.data.memory,
      cpuTime: response.data.cpuTime,
    });
  } catch (error) {
    console.error('JDoodle execution error:', error.response ? error.response.data : error.message);
    return res.status(500).json({
      error: 'Code execution failed',
      details: error.response ? error.response.data : error.message,
    });
  }
};
