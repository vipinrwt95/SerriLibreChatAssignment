<p align="center">
  <a href="https://librechat.ai">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://librechat.ai">LibreChat</a>
  </h1>
</p>

<p align="center">
  <strong>English</strong> ·
  <a href="README.zh.md">中文</a>
</p>

<p align="center">
  <a href="https://discord.librechat.ai"> 
    <img
      src="https://img.shields.io/discord/1086345563026489514?label=&logo=discord&style=for-the-badge&logoWidth=20&logoColor=white&labelColor=000000&color=blueviolet">
  </a>
  <a href="https://www.youtube.com/@LibreChat"> 
    <img
      src="https://img.shields.io/badge/YOUTUBE-red.svg?style=for-the-badge&logo=youtube&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a href="https://docs.librechat.ai"> 
    <img
      src="https://img.shields.io/badge/DOCS-blue.svg?style=for-the-badge&logo=read-the-docs&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
  <a aria-label="Sponsors" href="https://github.com/sponsors/danny-avila">
    <img
      src="https://img.shields.io/badge/SPONSORS-brightgreen.svg?style=for-the-badge&logo=github-sponsors&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
</p>

<p align="center">
<a href="https://railway.com/deploy/librechat-official?referralCode=HI9hWz&utm_medium=integration&utm_source=readme&utm_campaign=librechat">
  <img src="https://railway.com/button.svg" alt="Deploy on Railway" height="30">
</a>
<a href="https://zeabur.com/templates/0X2ZY8">
  <img src="https://zeabur.com/button.svg" alt="Deploy on Zeabur" height="30"/>
</a>
<a href="https://template.cloud.sealos.io/deploy?templateName=librechat">
  <img src="https://raw.githubusercontent.com/labring-actions/templates/main/Deploy-on-Sealos.svg" alt="Deploy on Sealos" height="30">
</a>
</p>

<p align="center">
  <a href="https://www.librechat.ai/docs/translation">
    <img 
      src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/4cb2598b-ed4d-469c-9b04-2ed531a8cb45&suffix=%+translated" 
      alt="Translation Progress">
  </a>
</p>


<hr>

<h1 align="center">🧪 Assignment: Contacts + Assistant Integration</h1>

<h2>📌 What was built</h2>
<ul>
  <li>Contact Management System</li>
  <li>CSV Import Functionality</li>
  <li>Contact Search API</li>
  <li>Query Builder Foundation</li>
  <li>Assistant-ready Retrieval Layer</li>
</ul>

<h2>▶️ How to Run the Project</h2>

<h2>🐳 Docker Setup (Recommended)</h2>

<p>
This project is fully Dockerized, so you do not need to manually manage Node.js, MongoDB, or dependencies.
Docker will handle all versions and services automatically.
</p>

<h3>✅ Prerequisites</h3>
<ul>
  <li>Install <strong>Docker</strong></li>
  <li>Install <strong>Docker Compose</strong></li>
</ul>

<h3>🚀 Quick Start (Using Docker)</h3>

<p>Just clone the repository and run:</p>

<pre><code>git clone https://github.com/vipinrwt95/SerriLibreChatAssignment.git
cd SerriLibreChatAssignment

docker compose up -d
</code></pre>

<p>This will:</p>
<ul>
  <li>Start backend server</li>
  <li>Start frontend</li>
  <li>Start MongoDB (if configured)</li>
  <li>Install all dependencies automatically</li>
</ul>

<h3>🌐 Access Application</h3>
<ul>
  <li>Frontend: <code>http://localhost:3080</code></li>
  <li>Backend API: <code>http://localhost:3080/api</code></li>
</ul>

<h3>🛑 Stop Services</h3>
<pre><code>docker compose down
</code></pre>

<h3>🔄 Rebuild (if needed)</h3>
<pre><code>docker compose up --build
</code></pre>

<p><strong>Note:</strong> Docker ensures a consistent environment across all systems, making setup fast and error-free.</p>

<h3>1. Clone Repository</h3>
<pre><code>git clone https://github.com/vipinrwt95/SerriLibreChatAssignment.git
cd SerriLibreChatAssignment
</code></pre>

<h3>2. Install Dependencies</h3>
<pre><code>npm install
</code></pre>

<h3>3. Setup Environment</h3>
<p>Create a <code>.env</code> file if not already present.</p>
<h3>🔑 3.1 Add Google API Key (Required for Assistant)</h3>

<p>This project uses Google models (Gemini) for assistant functionality.</p>

<h4>Step 1: Get API Key</h4>
<ul>
  <li>Go to: <a href="https://ai.google.dev/">https://ai.google.dev/</a></li>
  <li>Generate an API key</li>
</ul>

<h4>Step 2: Add to Environment File</h4>

<p>Add the following in your <code>.env</code> file:</p>

<pre><code>GOOGLE_API_KEY=your_google_api_key_here
</code></pre>

<h4>Step 3: Configure LibreChat</h4>

<p>Ensure your <code>librechat.yaml</code> (or config file) includes Google endpoint configuration.</p>

<pre><code>endpoints:
  google:
    models:
      default: ["gemini-2.5-flash-lite"]
    apiKey: ${GOOGLE_API_KEY}
</code></pre>

<h4>Step 4: Restart Server</h4>
<pre><code>npm run dev
</code></pre>

<p><strong>Note:</strong> Without this key, assistant features using Google models will not work.</p>
<pre><code>MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
</code></pre>

<h3>4. Run Backend</h3>
<pre><code>npm run backend
</code></pre>

<h3>5. Run Frontend</h3>
<pre><code>npm run frontend
</code></pre>

<h3>6. Or Run Full App</h3>
<pre><code>npm run dev
</code></pre>

<h2>🧪 How to Test the Assignment</h2>

<h3>1. Add Contact Manually</h3>
<ul>
  <li>Open the Contacts UI</li>
  <li>Fill the form</li>
  <li>Submit and verify the data in UI / database</li>
</ul>

<h3>2. Import CSV</h3>
<ul>
  <li>Upload a CSV file</li>
  <li>The system parses and stores contacts</li>
  <li>Verify import count in API response or UI</li>
</ul>

<h3>3. Fetch Contacts</h3>
<pre><code>GET /api/contacts
</code></pre>

<h3>4. Search Contacts</h3>
<pre><code>GET /api/contacts/search?query=vipin
</code></pre>

<h3>5. Validate Assistant Usage</h3>
<ul>
  <li>Verify contacts can be retrieved for prompt/context building</li>
  <li>Confirm query builder can use contact data as structured context</li>
</ul>

<h2>📌 Assignment Questions</h2>

<h3>1. If the system needed to support 1,000,000 contacts, how would you redesign it?</h3>
<p>To support 1 million contacts, I would redesign the system for scalability, retrieval quality, and operational reliability.</p>

<h4>Database / Storage</h4>
<ul>
  <li>Add indexes on fields like name, email, company, and role</li>
  <li>Use pagination instead of loading large result sets</li>
  <li>Store normalized searchable fields</li>
  <li>Separate raw imported data from cleaned contact records</li>
</ul>

<h4>Import Pipeline</h4>
<ul>
  <li>Move CSV import to background jobs / queues</li>
  <li>Process contacts in batches</li>
  <li>Add retry handling and failure reporting</li>
</ul>

<h4>Search</h4>
<ul>
  <li>Introduce a dedicated search engine such as Elasticsearch, OpenSearch, or Typesense</li>
  <li>Support fuzzy search, ranking, filtering, and fast pagination</li>
</ul>

<h4>Assistant Retrieval</h4>
<ul>
  <li>Store preprocessed contact text for retrieval</li>
  <li>Optionally add embeddings for semantic search</li>
  <li>Use hybrid retrieval: keyword + semantic search</li>
</ul>

<h4>Performance / Reliability</h4>
<ul>
  <li>Add caching (for example Redis)</li>
  <li>Monitor query latency and import performance</li>
  <li>Use read replicas if required</li>
</ul>

<h3>2. How would you ensure the assistant retrieves the most relevant contacts for a query?</h3>

<h4>Relevance Pipeline</h4>
<ol>
  <li><strong>Normalize the query</strong> — clean casing, spacing, punctuation, and identify possible entities like name, company, role, or email.</li>
  <li><strong>Hybrid retrieval</strong> — combine exact / partial keyword search with semantic search.</li>
  <li><strong>Ranking</strong> — rank results using exact match, prefix match, semantic similarity, recency, and profile completeness.</li>
  <li><strong>Filtering</strong> — apply filters such as company, role, source, tags, or ownership scope.</li>
  <li><strong>Reranking</strong> — reorder top results using a scoring layer or lightweight reranker.</li>
  <li><strong>Context control</strong> — pass only the top relevant contacts to the assistant to avoid noisy prompts.</li>
</ol>

<h3>3. What are the limitations of your current implementation?</h3>
<ul>
  <li>Search is basic and not optimized for very large datasets</li>
  <li>No dedicated search engine yet</li>
  <li>CSV import is likely synchronous and may be slow for large files</li>
  <li>No background processing / job queue</li>
  <li>No semantic retrieval yet</li>
  <li>Limited ranking and relevance tuning</li>
  <li>No strong deduplication flow yet</li>
  <li>No caching layer</li>
  <li>Assistant integration is still foundational rather than a full retrieval pipeline</li>
</ul>

<h2>🚀 Future Improvements</h2>
<ul>
  <li>Add background job queue for imports</li>
  <li>Add deduplication rules</li>
  <li>Integrate Elasticsearch / Typesense</li>
  <li>Add semantic search with embeddings</li>
  <li>Improve ranking and reranking</li>
  <li>Build a more advanced query builder UI</li>
  <li>Add analytics, monitoring, and import history</li>
</ul>

<h2>👤 Author</h2>
<p><strong>Vipin Rawat</strong></p>

<h2>🚀 Final Git Commands</h2>
<pre><code>git add README.md
git commit -m "Update README with assignment details"
git push
</code></pre>


# ✨ Features

- 🖥️ **UI & Experience** inspired by ChatGPT with enhanced design and features

- 🤖 **AI Model Selection**:  
  - Anthropic (Claude), AWS Bedrock, OpenAI, Azure OpenAI, Google, Vertex AI, OpenAI Responses API (incl. Azure)
  - [Custom Endpoints](https://www.librechat.ai/docs/quick_start/custom_endpoints): Use any OpenAI-compatible API with LibreChat, no proxy required
  - Compatible with [Local & Remote AI Providers](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints):
    - Ollama, groq, Cohere, Mistral AI, Apple MLX, koboldcpp, together.ai,
    - OpenRouter, Helicone, Perplexity, ShuttleAI, Deepseek, Qwen, and more

- 🔧 **[Code Interpreter API](https://www.librechat.ai/docs/features/code_interpreter)**: 
  - Secure, Sandboxed Execution in Python, Node.js (JS/TS), Go, C/C++, Java, PHP, Rust, and Fortran
  - Seamless File Handling: Upload, process, and download files directly
  - No Privacy Concerns: Fully isolated and secure execution

- 🔦 **Agents & Tools Integration**:  
  - **[LibreChat Agents](https://www.librechat.ai/docs/features/agents)**:
    - No-Code Custom Assistants: Build specialized, AI-driven helpers
    - Agent Marketplace: Discover and deploy community-built agents
    - Collaborative Sharing: Share agents with specific users and groups
    - Flexible & Extensible: Use MCP Servers, tools, file search, code execution, and more
    - Compatible with Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, Google, Vertex AI, Responses API, and more
    - [Model Context Protocol (MCP) Support](https://modelcontextprotocol.io/clients#librechat) for Tools

- 🔍 **Web Search**:  
  - Search the internet and retrieve relevant information to enhance your AI context
  - Combines search providers, content scrapers, and result rerankers for optimal results
  - **Customizable Jina Reranking**: Configure custom Jina API URLs for reranking services
  - **[Learn More →](https://www.librechat.ai/docs/features/web_search)**

- 🪄 **Generative UI with Code Artifacts**:  
  - [Code Artifacts](https://youtu.be/GfTj7O4gmd0?si=WJbdnemZpJzBrJo3) allow creation of React, HTML, and Mermaid diagrams directly in chat

- 🎨 **Image Generation & Editing**
  - Text-to-image and image-to-image with [GPT-Image-1](https://www.librechat.ai/docs/features/image_gen#1--openai-image-tools-recommended)
  - Text-to-image with [DALL-E (3/2)](https://www.librechat.ai/docs/features/image_gen#2--dalle-legacy), [Stable Diffusion](https://www.librechat.ai/docs/features/image_gen#3--stable-diffusion-local), [Flux](https://www.librechat.ai/docs/features/image_gen#4--flux), or any [MCP server](https://www.librechat.ai/docs/features/image_gen#5--model-context-protocol-mcp)
  - Produce stunning visuals from prompts or refine existing images with a single instruction

- 💾 **Presets & Context Management**:  
  - Create, Save, & Share Custom Presets  
  - Switch between AI Endpoints and Presets mid-chat
  - Edit, Resubmit, and Continue Messages with Conversation branching  
  - Create and share prompts with specific users and groups
  - [Fork Messages & Conversations](https://www.librechat.ai/docs/features/fork) for Advanced Context control

- 💬 **Multimodal & File Interactions**:  
  - Upload and analyze images with Claude 3, GPT-4.5, GPT-4o, o1, Llama-Vision, and Gemini 📸  
  - Chat with Files using Custom Endpoints, OpenAI, Azure, Anthropic, AWS Bedrock, & Google 🗃️

- 🌎 **Multilingual UI**:
  - English, 中文 (简体), 中文 (繁體), العربية, Deutsch, Español, Français, Italiano
  - Polski, Português (PT), Português (BR), Русский, 日本語, Svenska, 한국어, Tiếng Việt
  - Türkçe, Nederlands, עברית, Català, Čeština, Dansk, Eesti, فارسی
  - Suomi, Magyar, Հայերեն, Bahasa Indonesia, ქართული, Latviešu, ไทย, ئۇيغۇرچە

- 🧠 **Reasoning UI**:  
  - Dynamic Reasoning UI for Chain-of-Thought/Reasoning AI models like DeepSeek-R1

- 🎨 **Customizable Interface**:  
  - Customizable Dropdown & Interface that adapts to both power users and newcomers

- 🌊 **[Resumable Streams](https://www.librechat.ai/docs/features/resumable_streams)**:  
  - Never lose a response: AI responses automatically reconnect and resume if your connection drops
  - Multi-Tab & Multi-Device Sync: Open the same chat in multiple tabs or pick up on another device
  - Production-Ready: Works from single-server setups to horizontally scaled deployments with Redis

- 🗣️ **Speech & Audio**:  
  - Chat hands-free with Speech-to-Text and Text-to-Speech  
  - Automatically send and play Audio  
  - Supports OpenAI, Azure OpenAI, and Elevenlabs

- 📥 **Import & Export Conversations**:  
  - Import Conversations from LibreChat, ChatGPT, Chatbot UI  
  - Export conversations as screenshots, markdown, text, json

- 🔍 **Search & Discovery**:  
  - Search all messages/conversations

- 👥 **Multi-User & Secure Access**:
  - Multi-User, Secure Authentication with OAuth2, LDAP, & Email Login Support
  - Built-in Moderation, and Token spend tools

- ⚙️ **Configuration & Deployment**:  
  - Configure Proxy, Reverse Proxy, Docker, & many Deployment options  
  - Use completely local or deploy on the cloud

- 📖 **Open-Source & Community**:  
  - Completely Open-Source & Built in Public  
  - Community-driven development, support, and feedback

[For a thorough review of our features, see our docs here](https://docs.librechat.ai/) 📚

## 🪶 All-In-One AI Conversations with LibreChat

LibreChat is a self-hosted AI chat platform that unifies all major AI providers in a single, privacy-focused interface.

Beyond chat, LibreChat provides AI Agents, Model Context Protocol (MCP) support, Artifacts, Code Interpreter, custom actions, conversation search, and enterprise-ready multi-user authentication.

Open source, actively developed, and built for anyone who values control over their AI infrastructure.

---

## 🌐 Resources

**GitHub Repo:**
  - **RAG API:** [github.com/danny-avila/rag_api](https://github.com/danny-avila/rag_api)
  - **Website:** [github.com/LibreChat-AI/librechat.ai](https://github.com/LibreChat-AI/librechat.ai)

**Other:**
  - **Website:** [librechat.ai](https://librechat.ai)
  - **Documentation:** [librechat.ai/docs](https://librechat.ai/docs)
  - **Blog:** [librechat.ai/blog](https://librechat.ai/blog)

---

## 📝 Changelog

Keep up with the latest updates by visiting the releases page and notes:
- [Releases](https://github.com/danny-avila/LibreChat/releases)
- [Changelog](https://www.librechat.ai/changelog) 

**⚠️ Please consult the [changelog](https://www.librechat.ai/changelog) for breaking changes before updating.**

---

## ⭐ Star History

<p align="center">
  <a href="https://star-history.com/#danny-avila/LibreChat&Date">
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date&theme=dark" onerror="this.src='https://api.star-history.com/svg?repos=danny-avila/LibreChat&type=Date'" />
  </a>
</p>
<p align="center">
  <a href="https://trendshift.io/repositories/4685" target="_blank" style="padding: 10px;">
    <img src="https://trendshift.io/api/badge/repositories/4685" alt="danny-avila%2FLibreChat | Trendshift" style="width: 250px; height: 55px;" width="250" height="55"/>
  </a>
  <a href="https://runacap.com/ross-index/q1-24/" target="_blank" rel="noopener" style="margin-left: 20px;">
    <img style="width: 260px; height: 56px" src="https://runacap.com/wp-content/uploads/2024/04/ROSS_badge_white_Q1_2024.svg" alt="ROSS Index - Fastest Growing Open-Source Startups in Q1 2024 | Runa Capital" width="260" height="56"/>
  </a>
</p>

---

## ✨ Contributions

Contributions, suggestions, bug reports and fixes are welcome!

For new features, components, or extensions, please open an issue and discuss before sending a PR.

If you'd like to help translate LibreChat into your language, we'd love your contribution! Improving our translations not only makes LibreChat more accessible to users around the world but also enhances the overall user experience. Please check out our [Translation Guide](https://www.librechat.ai/docs/translation).

---

## 💖 This project exists in its current state thanks to all the people who contribute

<a href="https://github.com/danny-avila/LibreChat/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=danny-avila/LibreChat" />
</a>

---

## 🎉 Special Thanks

We thank [Locize](https://locize.com) for their translation management tools that support multiple languages in LibreChat.

<p align="center">
  <a href="https://locize.com" target="_blank" rel="noopener noreferrer">
    <img src="https://github.com/user-attachments/assets/d6b70894-6064-475e-bb65-92a9e23e0077" alt="Locize Logo" height="50">
  </a>
</p>
