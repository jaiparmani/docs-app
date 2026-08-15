---
tags: [aws, certification, ai-practitioner, mock-exam]
lesson: 38
exam: AIF-C01
---

# Mock Exam 1 (65 Questions)

<small>13 min read</small>

> Domain weighting mirrors the real AIF-C01 blueprint: Domain 1 – Fundamentals of AI/ML (~20%), Domain 2 – Fundamentals of Generative AI (~24%), Domain 3 – Applications of Foundation Models (~28%), Domain 4 – Guidelines for Responsible AI (~14%), Domain 5 – Security, Compliance & Governance (~14%).
>
> Time yourself: 90 minutes. Click each answer to reveal it — don't peek before you've committed to a choice.

## Domain 1 – Fundamentals of AI and ML (Q1–13)

**1.** Which term describes a model learning from labeled input-output pairs?
A. Unsupervised learning B. Supervised learning C. Reinforcement learning D. Transfer learning

> [!success]- Answer
> **B** — labeled data = supervised learning.

**2.** A model that clusters customers into segments without predefined labels is using:
A. Supervised learning B. Reinforcement learning C. Unsupervised learning D. Fine-tuning

> [!success]- Answer
> **C** — no labels, groups by similarity = unsupervised.

**3.** In reinforcement learning, the signal that tells an agent whether an action was good or bad is called:
A. Loss B. Reward C. Gradient D. Embedding

> [!success]- Answer
> **B** — the reward signal drives RL.

**4.** Which of the following is a core building block of a neural network?
A. Vector database B. Neuron/perceptron with weights C. Tokenizer D. Guardrail

> [!success]- Answer
> **B** — neurons with weights are the base unit.

**5.** Deep learning primarily differs from classical ML by:
A. Using no data B. Using many layers of neurons to learn hierarchical features C. Avoiding GPUs D. Requiring no training

> [!success]- Answer
> **B** — depth enables hierarchical feature learning.

**6.** Overfitting occurs when a model:
A. Performs well on training data but poorly on unseen data B. Performs poorly on all data C. Has too few parameters D. Was never trained

> [!success]- Answer
> **A** — overfitting = memorizes training, fails to generalize.

**7.** Which technique helps reduce overfitting?
A. Increasing model size indefinitely B. Regularization / dropout C. Removing all validation data D. Reducing training data variety

> [!success]- Answer
> **B** — regularization/dropout curbs overfitting.

**8.** A confusion matrix is primarily used to evaluate:
A. Regression models B. Classification model performance C. Clustering quality D. Token counts

> [!success]- Answer
> **B** — confusion matrix = classification evaluation.

**9.** Precision in a classification context measures:
A. Of all actual positives, how many were predicted correctly B. Of all predicted positives, how many were actually correct C. Total accuracy D. Model latency

> [!success]- Answer
> **B** — precision = correct positives / predicted positives.

**10.** Which AWS service is purpose-built for building, training, and deploying custom ML models end-to-end?
A. Amazon Bedrock B. Amazon SageMaker AI C. Amazon Comprehend D. Amazon Q

> [!success]- Answer
> **B** — SageMaker is the full custom ML build/train/deploy service.

**11.** A company wants to predict numeric house prices from features like size and location. This is an example of:
A. Classification B. Regression C. Clustering D. Generation

> [!success]- Answer
> **B** — continuous numeric output = regression.

**12.** What is "transfer learning"?
A. Moving data between AWS regions B. Reusing a pretrained model's learned features for a new, related task C. Encrypting model weights D. Converting text to tokens

> [!success]- Answer
> **B** — reusing pretrained knowledge for a new task.

**13.** Which of these is NOT a typical ML lifecycle stage?
A. Data collection B. Model training C. Guardrail configuration D. Model monitoring

> [!success]- Answer
> **C** — guardrails are a Bedrock responsible-AI feature, not a generic ML lifecycle stage.

## Domain 2 – Fundamentals of Generative AI (Q14–29)

**14.** A transformer's self-attention mechanism primarily allows the model to:
A. Compress images B. Weigh the relevance of different tokens to each other in a sequence C. Encrypt embeddings D. Reduce token count

> [!success]- Answer
> **B** — self-attention weighs token relevance.

**15.** What is a "foundation model"?
A. A small model trained for one narrow task B. A large, pretrained model adaptable to many downstream tasks C. A rules-based expert system D. A database index

> [!success]- Answer
> **B** — foundation model = large, broadly adaptable pretrained model.

**16.** Tokenization refers to:
A. Encrypting a prompt B. Breaking text into smaller units the model can process C. Compressing a vector database D. Generating an API key

> [!success]- Answer
> **B** — tokenization splits text into processable units.

**17.** An embedding is best described as:
A. A numeric vector representing semantic meaning of text/data B. A prompt template C. A guardrail policy D. A model checkpoint file

> [!success]- Answer
> **A** — embedding = semantic vector representation.

**18.** Which AWS service is a purpose-built, managed vector store often paired with Bedrock Knowledge Bases?
A. Amazon RDS B. Amazon OpenSearch Service (vector engine) C. Amazon SNS D. AWS Glue

> [!success]- Answer
> **B** — OpenSearch Service vector engine is the common Bedrock KB vector store.

**19.** RAG (Retrieval-Augmented Generation) is primarily used to:
A. Permanently update model weights B. Ground responses in external, up-to-date data at inference time C. Reduce token limits D. Replace fine-tuning entirely in all cases

> [!success]- Answer
> **B** — RAG grounds responses with live external retrieval.

**20.** Increasing the "temperature" parameter during generation typically:
A. Makes output more deterministic B. Increases randomness/creativity of output C. Increases the context window D. Reduces hallucination

> [!success]- Answer
> **B** — higher temperature = more randomness.

**21.** "Top-P" (nucleus sampling) controls generation by:
A. Selecting from the smallest set of tokens whose cumulative probability exceeds P B. Limiting max output tokens C. Setting a hard vocabulary limit D. Adjusting learning rate

> [!success]- Answer
> **A** — Top-P samples from a cumulative probability mass.

**22.** A "stop sequence" in generation parameters is used to:
A. Halt generation once a specified string is produced B. Increase creativity C. Reduce embedding dimensions D. Trigger fine-tuning

> [!success]- Answer
> **A** — stop sequence halts generation at a marker.

**23.** Hallucination in generative AI refers to:
A. The model refusing to answer B. The model producing plausible-sounding but factually incorrect output C. A GPU memory error D. A tokenization failure

> [!success]- Answer
> **B** — hallucination = confident but false output.

**24.** Which technique most directly reduces hallucination by grounding answers in real documents?
A. Increasing temperature B. RAG C. Reducing max tokens D. Using a smaller model

> [!success]- Answer
> **B** — RAG grounds output in real retrieved data.

**25.** Fine-tuning a foundation model is most appropriate when you need:
A. Access to today's stock prices B. Consistent style/format/behavior baked into the model for a narrow task C. To avoid all training cost D. Real-time external lookups

> [!success]- Answer
> **B** — fine-tuning bakes in consistent narrow-task behavior.

**26.** Prompt engineering is best described as:
A. Modifying model weights B. Crafting inputs (instructions, examples, context) to guide model output without retraining C. Encrypting prompts D. A form of data labeling

> [!success]- Answer
> **B** — prompt engineering shapes input, not weights.

**27.** A "few-shot prompt" includes:
A. Zero examples B. A handful of example input-output pairs to guide the model C. Only system-level instructions D. Fine-tuning data only

> [!success]- Answer
> **B** — few-shot = a handful of guiding examples.

**28.** What is the primary tradeoff of a very large context window?
A. Always improves accuracy for free B. Higher cost/latency and possible "lost in the middle" attention issues C. It disables tokenization D. It removes the need for embeddings

> [!success]- Answer
> **B** — larger context costs more and can dilute attention.

**29.** Multimodal models are distinguished by their ability to:
A. Only process text B. Process/generate across multiple data types (text, image, audio, etc.) C. Run only on SageMaker D. Avoid tokenization

> [!success]- Answer
> **B** — multimodal spans multiple data types.

## Domain 3 – Applications of Foundation Models (Q30–47)

**30.** A company wants to let a model check live inventory and place an order via API during a conversation. This requires:
A. Fine-tuning only B. An AI agent with tool use / function calling C. A larger context window only D. Prompt engineering alone

> [!success]- Answer
> **B** — live action + API call = agent with tool use.

**31.** Which AWS feature lets you build a visual, low-code sequential pipeline chaining Bedrock models, Knowledge Bases, and Lambda functions?
A. Bedrock Guardrails B. Bedrock Flows C. Bedrock Agents D. SageMaker Pipelines

> [!success]- Answer
> **B** — Bedrock Flows = visual low-code sequential orchestration.

**32.** Amazon Bedrock Knowledge Bases are best suited for:
A. Taking real-world actions via API B. Grounding model responses in your private documents via RAG C. Training models from scratch D. Real-time speech transcription

> [!success]- Answer
> **B** — Knowledge Bases = RAG grounding, retrieval only.

**33.** What differentiates Agents for Amazon Bedrock from a Knowledge Base?
A. Agents can only retrieve text B. Agents can invoke actions/APIs in addition to retrieval C. Knowledge Bases can execute Lambda functions directly D. There is no difference

> [!success]- Answer
> **B** — agents add action-taking beyond retrieval.

**34.** On-Demand throughput on Bedrock is best suited for:
A. Predictable, high, sustained traffic requiring guaranteed capacity B. Variable, unpredictable workloads paying per token/request C. Training custom models D. Batch-only inference exclusively

> [!success]- Answer
> **B** — On-Demand = pay-per-use, variable workloads.

**35.** Provisioned Throughput on Bedrock is best suited for:
A. Sporadic light usage B. Consistent, high-volume production workloads needing guaranteed throughput C. One-off experimentation D. Free-tier testing

> [!success]- Answer
> **B** — Provisioned Throughput = guaranteed capacity for steady high volume.

**36.** Which SageMaker capability automatically builds and tunes models with minimal manual ML expertise?
A. SageMaker Ground Truth B. SageMaker Autopilot (AutoML) C. SageMaker Studio D. SageMaker Debugger

> [!success]- Answer
> **B** — Autopilot = AutoML with minimal manual tuning.

**37.** When should you choose SageMaker over Bedrock?
A. When you just need to prompt a pretrained foundation model B. When you need full control to build/train custom models from your own data/algorithms C. When you only need RAG D. When you only need content filtering

> [!success]- Answer
> **B** — SageMaker for full custom model build/training control.

**38.** Amazon Rekognition is primarily used for:
A. Text extraction from PDFs B. Image and video analysis (objects, faces, moderation) C. Speech-to-text D. Text translation

> [!success]- Answer
> **B** — Rekognition = image/video analysis.

**39.** Amazon Textract is primarily used for:
A. Sentiment analysis B. Extracting text and structured data (forms, tables) from documents C. Text-to-speech D. Language translation

> [!success]- Answer
> **B** — Textract = document text/data extraction.

**40.** Amazon Comprehend is primarily used for:
A. Image labeling B. Natural language processing: sentiment, entities, key phrases C. Speech synthesis D. Video content moderation

> [!success]- Answer
> **B** — Comprehend = NLP (sentiment, entities, key phrases).

**41.** Amazon Polly's primary function is:
A. Speech-to-text B. Text-to-speech C. Language translation D. Chatbot orchestration

> [!success]- Answer
> **B** — Polly = text-to-speech.

**42.** Amazon Transcribe's primary function is:
A. Text-to-speech B. Speech-to-text C. Document extraction D. Sentiment analysis

> [!success]- Answer
> **B** — Transcribe = speech-to-text.

**43.** Amazon Lex is primarily used to build:
A. Custom ML training pipelines B. Conversational chatbots/voice interfaces C. Recommendation engines D. Vector databases

> [!success]- Answer
> **B** — Lex = conversational bots/voice interfaces.

**44.** Amazon Personalize is used for:
A. Document translation B. Real-time recommendation systems C. Speech transcription D. Image moderation

> [!success]- Answer
> **B** — Personalize = recommendation engine.

**45.** A retail company needs product recommendations tailored to each shopper in real time. Best fit:
A. Amazon Textract B. Amazon Personalize C. Amazon Polly D. Amazon Rekognition

> [!success]- Answer
> **B** — real-time personalized recommendations = Personalize.

**46.** A media company needs to auto-generate subtitles from video audio. Best fit:
A. Amazon Translate B. Amazon Transcribe C. Amazon Lex D. Amazon Comprehend

> [!success]- Answer
> **B** — audio-to-subtitle text = Transcribe.

**47.** Amazon Q is best described as:
A. A vector database B. A generative AI-powered assistant for business/work tasks (and Q Developer for coding) C. A speech synthesis engine D. A model training service

> [!success]- Answer
> **B** — Q = GenAI assistant for work/business tasks (Q Developer for code).

## Domain 4 – Guidelines for Responsible AI (Q48–56)

**48.** "Fairness" in responsible AI primarily addresses:
A. Model latency B. Avoiding systematic bias against groups in model outcomes C. Encryption strength D. Token cost

> [!success]- Answer
> **B** — fairness = avoiding systematic group bias.

**49.** "Explainability" refers to:
A. Making model architecture faster B. The ability to understand/articulate why a model produced a given output C. Reducing dataset size D. Encrypting training data

> [!success]- Answer
> **B** — explainability = understanding the "why" behind outputs.

**50.** Which AWS feature helps prevent a model from generating harmful, off-topic, or PII-leaking content?
A. Bedrock Guardrails B. Bedrock Flows C. SageMaker Autopilot D. Amazon Textract

> [!success]- Answer
> **A** — Guardrails filter harmful/off-topic/PII content.

**51.** "Human-in-the-loop" oversight is most important for:
A. Fully automating every decision with no review B. High-stakes or irreversible decisions where human review adds safety C. Reducing model accuracy D. Increasing token limits

> [!success]- Answer
> **B** — human review matters most for high-stakes/irreversible actions.

**52.** Bias in an ML model most commonly originates from:
A. The AWS region used B. Unrepresentative or skewed training data C. The programming language used D. The size of the vector database

> [!success]- Answer
> **B** — biased/unrepresentative training data is the most common bias source.

**53.** Transparency in AI systems means:
A. Hiding model limitations from users B. Clearly communicating a system's capabilities, limitations, and intended use C. Publishing model weights publicly always D. Removing all documentation

> [!success]- Answer
> **B** — transparency = clear communication of capabilities/limits.

**54.** Which practice best supports privacy in an AI solution handling customer PII?
A. Logging all raw PII in plaintext indefinitely B. Data minimization, masking/redaction, and access controls C. Sharing PII across all teams D. Skipping data governance

> [!success]- Answer
> **B** — minimization, masking, and access controls protect PII.

**55.** The Responsible AI lifecycle is best understood as:
A. A one-time checklist before launch B. An ongoing process spanning design, development, deployment, and monitoring C. Only a legal/compliance function D. Something only data scientists need to consider

> [!success]- Answer
> **B** — responsible AI is continuous, not a one-time gate.

**56.** A model consistently underperforms for one demographic group. This is primarily a concern of:
A. Latency optimization B. Fairness / bias C. Token pricing D. Vector indexing

> [!success]- Answer
> **B** — group-specific underperformance = fairness/bias issue.

## Domain 5 – Security, Compliance, and Governance for AI Solutions (Q57–65)

**57.** Under the AWS Shared Responsibility Model, AWS is responsible for:
A. Customer's IAM policy configuration B. Security "of" the cloud (infrastructure, hardware, managed service security) C. Customer's data classification D. Application-level access control logic

> [!success]- Answer
> **B** — AWS secures "of" the cloud.

**58.** Under the AWS Shared Responsibility Model, the customer is responsible for:
A. Physical data center security B. Security "in" the cloud — data, IAM configuration, access management C. Hardware maintenance D. Global network infrastructure

> [!success]- Answer
> **B** — customer secures "in" the cloud (data, IAM, access).

**59.** Which AWS service manages encryption keys for data at rest across AWS AI services?
A. AWS KMS B. Amazon Comprehend C. AWS Glue D. Amazon Polly

> [!success]- Answer
> **A** — AWS KMS manages encryption keys.

**60.** The principle of least privilege in IAM means:
A. Granting broad admin access by default B. Granting only the minimum permissions needed to perform a task C. Disabling all permissions D. Sharing root credentials across teams

> [!success]- Answer
> **B** — least privilege = minimum necessary access.

**61.** Which encryption type protects data as it moves between a client and a Bedrock endpoint?
A. Encryption at rest B. Encryption in transit (TLS) C. Client-side hashing only D. No encryption is used by AWS

> [!success]- Answer
> **B** — TLS protects data in transit.

**62.** A regulated financial company needs an audit trail of every model invocation and configuration change. Which AWS service helps most directly?
A. Amazon Polly B. AWS CloudTrail C. Amazon Lex D. Amazon Rekognition

> [!success]- Answer
> **B** — CloudTrail provides the audit/API-call trail.

**63.** Data residency/compliance requirements in AI solutions are primarily addressed by:
A. Ignoring regional laws B. Choosing appropriate AWS Regions and following applicable compliance frameworks C. Using only on-demand throughput D. Disabling guardrails

> [!success]- Answer
> **B** — Region selection + compliance frameworks address residency.

**64.** Governance of AI systems primarily involves:
A. Only technical model tuning B. Policies, accountability, and oversight structures for how AI is built and used C. Reducing model size D. Choosing a cheaper model

> [!success]- Answer
> **B** — governance = policy, accountability, oversight.

**65.** A company wants to prevent a Bedrock-powered chatbot from ever discussing competitor products. The most direct AWS solution:
A. Increase temperature B. Configure a Bedrock Guardrail with denied topics C. Use a bigger foundation model D. Disable CloudTrail

> [!success]- Answer
> **B** — Guardrails with denied topics is the direct, purpose-built control.

## Next
[39 - Mock Exam 2](39 - Mock Exam 2.md)


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
- [Mock Exam 2 (65 Questions)](39%20-%20Mock%20Exam%202.md)
