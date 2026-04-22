const fs = require('fs');

async function download(url, dest) {
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync(dest, text);
  console.log('Downloaded', dest);
}

download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzJkZjJlMDc2ODUyZjQxM2RiNDQ1YTM4OWRlZjdkNjA3EgsSBxDl77Ow2wcYAZIBIwoKcHJvamVjdF9pZBIVQhM5NDEyMDk4Mzk3ODk1MDY3OTc5&filename=&opi=89354086', 'tmp/landing_prof.html');

download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzc0N2RhMDA1MDhjYTRhOTA5ZmQ3N2M0ZjM5MjkzMjYzEgsSBxDl77Ow2wcYAZIBIwoKcHJvamVjdF9pZBIVQhM5NDEyMDk4Mzk3ODk1MDY3OTc5&filename=&opi=89354086', 'tmp/landing_data.html');

download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2NmZWIwMWJkMGRjODRhMjM4NGJlYWY1YjU3NGUwMjExEgsSBxDl77Ow2wcYAZIBIwoKcHJvamVjdF9pZBIVQhM5NDEyMDk4Mzk3ODk1MDY3OTc5&filename=&opi=89354086', 'tmp/chatbot.html');

download('https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE2YzFlYTBmNDg4YjRmYWVhMjVlOWY4OTg3OWZiY2Q0EgsSBxDl77Ow2wcYAZIBIwoKcHJvamVjdF9pZBIVQhM5NDEyMDk4Mzk3ODk1MDY3OTc5&filename=&opi=89354086', 'tmp/analytics.html');
