export interface CodeGenRequest {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  streaming?: boolean;
}

export function generateCode(request: CodeGenRequest, language: string): string {
  const { method, url, headers, body, streaming } = request;
  
  // Sanitize headers
  const sanitizedHeaders = { ...headers };
  for (const key in sanitizedHeaders) {
    if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'api-key' || key.toLowerCase() === 'x-api-key') {
      const val = sanitizedHeaders[key];
      if (val.toLowerCase().startsWith('bearer ')) {
        sanitizedHeaders[key] = 'Bearer YOUR_API_KEY';
      } else {
        sanitizedHeaders[key] = 'YOUR_API_KEY';
      }
    }
  }

  const isChatCompletion = url.endsWith('/v1/chat/completions');

  switch (language.toLowerCase()) {
    case 'curl':
      return generateCurl(method, url, sanitizedHeaders, body, streaming);
    case 'python':
      return generatePython(method, url, sanitizedHeaders, body, streaming, isChatCompletion);
    case 'javascript':
    case 'js':
      return generateJavaScript(method, url, sanitizedHeaders, body, streaming, isChatCompletion);
    case 'typescript':
    case 'ts':
      return generateTypeScript(method, url, sanitizedHeaders, body, streaming, isChatCompletion);
    case 'go':
      return generateGo(method, url, sanitizedHeaders, body, streaming);
    case 'java':
      return generateJava(method, url, sanitizedHeaders, body, streaming);
    case 'c#':
    case 'csharp':
      return generateCSharp(method, url, sanitizedHeaders, body, streaming);
    case 'php':
      return generatePHP(method, url, sanitizedHeaders, body, streaming);
    default:
      return generateCurl(method, url, sanitizedHeaders, body, streaming);
  }
}

function generateCurl(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean): string {
  let cmd = `curl -X ${method.toUpperCase()} "${url}" \\\n`;
  for (const [key, value] of Object.entries(headers)) {
    cmd += `  -H "${key}: ${value}" \\\n`;
  }
  if (body) {
    const escapedBody = body.replace(/"/g, '\\"').replace(/\n/g, '');
    cmd += `  -d "${escapedBody}"`;
  } else {
    cmd = cmd.trim().replace(/\\$/, '');
  }
  return cmd;
}

function generatePython(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean, isChatCompletion?: boolean): string {
  if (isChatCompletion) {
    let parsedBody: any = {};
    try { if (body) parsedBody = JSON.parse(body); } catch(e) {}
    return `# OpenAI SDK Example
from openai import OpenAI

client = OpenAI(
    base_url="${url.replace('/v1/chat/completions', '/v1')}",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="${parsedBody.model || 'model-id'}",
    messages=${JSON.stringify(parsedBody.messages || [], null, 4)},
    stream=${streaming ? 'True' : 'False'}
)

${streaming ? 'for chunk in response:\n    print(chunk.choices[0].delta.content or "", end="")' : 'print(response.choices[0].message.content)'}

# --- OR Using Requests ---

import requests

headers = ${JSON.stringify(headers, null, 4)}
${body ? `json_data = ${body}` : ''}

response = requests.${method.toLowerCase()}(
    '${url}',
    headers=headers${body ? ',\n    json=json_data' : ''}${streaming ? ',\n    stream=True' : ''}
)

${streaming ? 'for line in response.iter_lines():\n    if line:\n        print(line.decode("utf-8"))' : 'print(response.json())'}`;
  }

  return `import requests

headers = ${JSON.stringify(headers, null, 4)}
${body ? `\ndata = '''${body}'''\n` : ''}
response = requests.${method.toLowerCase()}('${url}', headers=headers${body ? ', data=data' : ''}${streaming ? ', stream=True' : ''})

${streaming ? 'for line in response.iter_lines():\n    if line:\n        print(line.decode("utf-8"))' : 'print(response.text)'}`;
}

function generateJavaScript(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean, isChatCompletion?: boolean): string {
  if (isChatCompletion) {
    let parsedBody: any = {};
    try { if (body) parsedBody = JSON.parse(body); } catch(e) {}
    return `// OpenAI SDK Example
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: '${url.replace('/v1/chat/completions', '/v1')}',
  apiKey: 'YOUR_API_KEY',
  dangerouslyAllowBrowser: true
});

async function main() {
  const response = await openai.chat.completions.create({
    model: '${parsedBody.model || 'model-id'}',
    messages: ${JSON.stringify(parsedBody.messages || [], null, 4)},
    stream: ${streaming ? 'true' : 'false'},
  });

  ${streaming ? 'for await (const chunk of response) {\n    process.stdout.write(chunk.choices[0]?.delta?.content || "");\n  }' : 'console.log(response.choices[0].message.content);'}
}
main();

// --- OR Using fetch ---

const options = {
  method: '${method.toUpperCase()}',
  headers: ${JSON.stringify(headers, null, 2)}${body ? `,\n  body: JSON.stringify(${body})` : ''}
};

fetch('${url}', options)
  .then(response => response.json())
  .then(response => console.log(response))
  .catch(err => console.error(err));`;
  }
  
  return `const options = {
  method: '${method.toUpperCase()}',
  headers: ${JSON.stringify(headers, null, 2)}${body ? `,\n  body: JSON.stringify(${body})` : ''}
};

fetch('${url}', options)
  .then(response => ${streaming ? 'response.body' : 'response.json()'})
  .then(response => console.log(response))
  .catch(err => console.error(err));`;
}

function generateTypeScript(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean, isChatCompletion?: boolean): string {
  return generateJavaScript(method, url, headers, body, streaming, isChatCompletion).replace('const options = {', 'const options: RequestInit = {');
}

function generateGo(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean): string {
  return `package main

import (
\t"fmt"
\t"net/http"
\t"io"
${body ? '\t"strings"\n' : ''})

func main() {
\turl := "${url}"
\tmethod := "${method.toUpperCase()}"

${body ? `\tpayload := strings.NewReader(\`${body}\`)

\treq, err := http.NewRequest(method, url, payload)
` : `\treq, err := http.NewRequest(method, url, nil)
`}
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
${Object.entries(headers).map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`).join('\n')}

\tres, err := http.DefaultClient.Do(req)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tdefer res.Body.Close()

\tbody, err := io.ReadAll(res.Body)
\tif err != nil {
\t\tfmt.Println(err)
\t\treturn
\t}
\tfmt.Println(string(body))
}`;
}

function generateJava(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean): string {
  return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class Main {
  public static void main(String[] args) throws Exception {
    HttpRequest request = HttpRequest.newBuilder()
      .uri(URI.create("${url}"))
${Object.entries(headers).map(([k, v]) => `      .header("${k}", "${v}")`).join('\n')}
${body ? `      .method("${method.toUpperCase()}", HttpRequest.BodyPublishers.ofString("${body.replace(/"/g, '\\"').replace(/\n/g, '')}"))` : `      .method("${method.toUpperCase()}", HttpRequest.BodyPublishers.noBody())`}
      .build();

    HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    System.out.println(response.body());
  }
}`;
}

function generateCSharp(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean): string {
  return `using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
  static async Task Main(string[] args) {
    var client = new HttpClient();
    var request = new HttpRequestMessage(HttpMethod.${method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()}, "${url}");
${Object.entries(headers).map(([k, v]) => `    request.Headers.Add("${k}", "${v}");`).join('\n')}
${body ? `    request.Content = new StringContent("${body.replace(/"/g, '\\"').replace(/\n/g, '')}");\n` : ''}
    var response = await client.SendAsync(request);
    response.EnsureSuccessStatusCode();
    var responseBody = await response.Content.ReadAsStringAsync();
    Console.WriteLine(responseBody);
  }
}`;
}

function generatePHP(method: string, url: string, headers: Record<string, string>, body?: string, streaming?: boolean): string {
  return `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => "",
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 30,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => "${method.toUpperCase()}",
${body ? `  CURLOPT_POSTFIELDS => "${body.replace(/"/g, '\\"').replace(/\n/g, '')}",\n` : ''}  CURLOPT_HTTPHEADER => [
${Object.entries(headers).map(([k, v]) => `    "${k}: ${v}"`).join(',\n')}
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`;
}
