---
tags: [aws, certification, ai-practitioner, mock-exam]
lesson: 39
exam: AIF-C01
---

# Mock Exam 2 (65 Questions)

<small>22 min read</small>

> Same domain weighting as [38 - Mock Exam 1](38 - Mock Exam 1.md): Domain 1 – Fundamentals of AI/ML (~20%), Domain 2 – Fundamentals of Generative AI (~24%), Domain 3 – Applications of Foundation Models (~28%), Domain 4 – Guidelines for Responsible AI (~14%), Domain 5 – Security, Compliance & Governance (~14%).
>
> Time yourself: 90 minutes. Click each answer to reveal it — don't peek before you've committed to a choice. All 65 questions here are new, not repeats of Mock 1.

## Domain 1 – Fundamentals of AI and ML (Q1–13)

**1.** What is the primary purpose of a validation set during model training?
A. To provide the final, unbiased performance number B. To tune hyperparameters and select between candidate models during training C. To serve as the production inference data D. To replace the need for a test set entirely

> [!success]- Answer
> **B** — the validation set guides hyperparameter tuning and model selection; the test set (held out separately) provides the final unbiased evaluation.

**2.** A model performs poorly on both training and test data. This is best described as:
A. Overfitting B. Underfitting C. Perfect generalization D. Data leakage

> [!success]- Answer
> **B** — underfitting: the model is too simple to capture the underlying pattern, so it performs poorly everywhere, including on the data it trained on.

**3.** The bias-variance tradeoff describes:
A. A tradeoff between model cost and GPU usage B. Balancing a model too simple to fit the data against a model too complex and overfit C. A tradeoff unique to reinforcement learning D. The tradeoff between training and inference latency

> [!success]- Answer
> **B** — high bias (underfitting) and high variance (overfitting) sit on opposite ends of model complexity; the goal is a balance that generalizes well.

**4.** Recall in a classification context measures:
A. Of all predicted positives, how many were correct B. Of all actual positives, how many were correctly identified C. Overall accuracy across all classes D. Model inference latency

> [!success]- Answer
> **B** — recall = true positives / (true positives + false negatives): out of everything that was actually positive, how much did the model catch.

**5.** The F1 score is best described as:
A. The average of training and validation loss B. The harmonic mean of precision and recall C. A measure of regression error D. A measure of model training speed

> [!success]- Answer
> **B** — F1 balances precision and recall into a single number, useful when you care about both and neither alone tells the full story.

**6.** RMSE (Root Mean Squared Error) is a metric primarily used to evaluate:
A. Classification models B. Regression models C. Clustering models D. Tokenization quality

> [!success]- Answer
> **B** — RMSE measures the average magnitude of prediction error for continuous numeric outputs, a regression-specific metric.

**7.** AUC-ROC is used to evaluate:
A. A regression model's average error B. A classification model's ability to distinguish classes across different thresholds C. A clustering model's silhouette score D. A vector database's query latency

> [!success]- Answer
> **B** — AUC-ROC summarizes how well a classifier separates positive from negative classes across all possible decision thresholds, not just one.

**8.** Semi-supervised learning refers to:
A. Training with only labeled data B. Training with only unlabeled data C. Training with a combination of a small labeled dataset and a larger unlabeled dataset D. A synonym for reinforcement learning

> [!success]- Answer
> **C** — semi-supervised learning leverages a small amount of labeled data alongside a much larger pool of unlabeled data, cheaper than fully labeling everything.

**9.** Feature engineering refers to:
A. Designing a model's neural network architecture B. Transforming raw data into representations that better help a model learn the underlying problem C. Encrypting features before training D. Selecting which AWS Region to train in

> [!success]- Answer
> **B** — feature engineering shapes raw input data into a form (derived variables, transformations) that makes the underlying pattern easier for a model to learn.

**10.** Which SageMaker capability is purpose-built for labeling large training datasets, including with human annotators?
A. SageMaker Autopilot B. SageMaker Ground Truth C. SageMaker Debugger D. SageMaker Model Monitor

> [!success]- Answer
> **B** — Ground Truth is SageMaker's data-labeling service, supporting human-in-the-loop annotation workflows for building training datasets.

**11.** Which SageMaker capability provides a centralized repository for storing, sharing, and reusing ML features across teams and models?
A. SageMaker Feature Store B. SageMaker Studio C. SageMaker Clarify D. SageMaker Neo

> [!success]- Answer
> **A** — Feature Store centralizes engineered features so they can be consistently reused across training and inference, and shared across teams.

**12.** A fraud-detection model needs to score transactions instantly as they occur, one at a time. This calls for:
A. Batch inference B. Real-time inference C. Offline inference only D. No inference is needed

> [!success]- Answer
> **B** — real-time inference (a persistent, low-latency endpoint) fits scoring individual events as they happen; batch inference is for processing large datasets asynchronously, not instant per-event scoring.

**13.** In model training, one "epoch" refers to:
A. One single training example processed B. One complete pass through the entire training dataset C. One unit of GPU cost D. One hyperparameter tuning trial

> [!success]- Answer
> **B** — an epoch is one full pass of the training algorithm over the entire training dataset; training typically runs for multiple epochs.

## Domain 2 – Fundamentals of Generative AI (Q14–29)

**14.** The transformer architecture largely replaced earlier recurrent (RNN-based) architectures for language tasks primarily because:
A. It requires no training data B. Self-attention allows parallel processing of a sequence instead of processing tokens strictly one at a time C. It eliminates the need for tokenization D. It only works for image data

> [!success]- Answer
> **B** — self-attention lets a transformer weigh relationships between all tokens in a sequence in parallel, unlike RNNs' inherently sequential, one-token-at-a-time processing — a major reason transformers train faster at scale.

**15.** Diffusion models are most commonly associated with:
A. Text tokenization B. Image generation, by iteratively denoising random noise into a coherent image C. Speech-to-text transcription D. Database indexing

> [!success]- Answer
> **B** — diffusion models generate images by starting from random noise and iteratively refining it into a coherent image, a different underlying mechanism than the transformer-based text generation covered elsewhere.

**16.** "Top-K" sampling during generation works by:
A. Selecting from the smallest set of tokens whose cumulative probability exceeds a threshold B. Restricting the next-token choice to only the K most probable candidate tokens C. Limiting the total output length to K tokens D. Setting the model's temperature to K

> [!success]- Answer
> **B** — Top-K restricts sampling to the K highest-probability next tokens, a fixed-count relative of Top-P's cumulative-probability approach.

**17.** A "zero-shot" prompt is one that:
A. Includes several worked examples before the actual task B. Gives the model an instruction with no examples at all C. Fine-tunes the model before generating D. Only works with image inputs

> [!success]- Answer
> **B** — zero-shot prompting gives the model a task instruction directly, with no example input-output pairs to guide it, relying entirely on the model's pretrained knowledge.

**18.** "Chain-of-thought" prompting improves performance on complex reasoning tasks by:
A. Reducing the model's context window B. Asking the model to show intermediate reasoning steps before the final answer C. Encrypting the prompt for security D. Increasing the temperature parameter

> [!success]- Answer
> **B** — explicitly prompting the model to reason step by step, rather than jump straight to a final answer, measurably improves accuracy on multi-step reasoning tasks.

**19.** A "system prompt" is best described as:
A. An error message returned by the model B. Persistent instructions/context that shape the model's behavior across a conversation, separate from the user's own messages C. A prompt only used during fine-tuning D. A prompt that bypasses all safety guardrails

> [!success]- Answer
> **B** — a system prompt sets standing behavior, role, or constraints for the model (e.g. "you are a helpful support assistant"), distinct from and typically prioritized over individual user messages.

**20.** A model's context window refers to:
A. The physical GPU memory allocated to it B. The maximum amount of text (input + output, measured in tokens) it can process in a single request C. The number of training epochs it completed D. The number of parameters in the model

> [!success]- Answer
> **B** — context window is the token budget for a single request/response cycle; exceeding it means older content must be truncated or summarized.

**21.** Vector similarity search commonly determines "how similar" two embeddings are using:
A. Cosine similarity B. SQL JOIN operations C. B-Tree range scans D. Regular expression matching

> [!success]- Answer
> **A** — cosine similarity (measuring the angle between two vectors) is the standard way to compare embeddings for semantic closeness in a vector database.

**22.** In the phrase "large language model," the word "large" primarily refers to:
A. The size of the company that built it B. The number of parameters (learned weights) in the model C. The number of GPUs used at inference time D. The size of the user's prompt

> [!success]- Answer
> **B** — "large" refers to the model's parameter count (often billions), which is what "large" scales as model capability generally grows.

**23.** During pretraining, a foundation model:
A. Is trained on a small, narrowly labeled dataset for one specific task B. Learns broad, general language/data patterns from a massive, largely unlabeled corpus C. Is only trained using reinforcement learning D. Requires no computation at all

> [!success]- Answer
> **B** — pretraining exposes the model to a massive, general corpus to learn broad patterns, before any task-specific fine-tuning narrows its behavior.

**24.** Instruction tuning refers to:
A. Encrypting model instructions B. Fine-tuning a model specifically on instruction-response pairs so it better follows explicit directions C. Increasing the model's context window D. A synonym for prompt engineering

> [!success]- Answer
> **B** — instruction tuning is a fine-tuning technique using examples of instructions paired with desired responses, improving the model's ability to follow directions generally, not just one narrow task.

**25.** RLHF (Reinforcement Learning from Human Feedback) is used to:
A. Replace pretraining entirely B. Align a model's outputs with human preferences, using human-ranked responses to train a reward signal C. Reduce the model's parameter count D. Speed up tokenization

> [!success]- Answer
> **B** — RLHF uses human feedback (typically rankings of candidate outputs) to train a reward model, then uses reinforcement learning to steer the base model's behavior toward outputs humans prefer.

**26.** "Prompt injection" refers to:
A. A technique for compressing prompts B. A malicious input designed to override or manipulate a model's intended instructions C. A method for fine-tuning faster D. A type of embedding compression

> [!success]- Answer
> **B** — prompt injection is an attack where crafted input tries to hijack the model's behavior (e.g. "ignore previous instructions and..."), a security concern for GenAI applications.

**27.** Model distillation refers to:
A. Removing all training data after training completes B. Training a smaller "student" model to mimic the behavior of a larger "teacher" model C. Converting a model to run only on CPUs D. A synonym for tokenization

> [!success]- Answer
> **B** — distillation transfers knowledge from a large, expensive model into a smaller, cheaper one that approximates its behavior, trading some capability for lower cost/latency.

**28.** An example of a genuinely multimodal input is:
A. A text-only chatbot prompt B. A request that includes both an image and a text question about that image, processed together C. Two separate, unrelated text prompts sent one after another D. A prompt written in two different human languages

> [!success]- Answer
> **B** — multimodal means the model processes multiple data types (e.g. image + text) together in a single request, not just text in different languages or sequential unrelated prompts.

**29.** Foundation model usage is typically billed based primarily on:
A. Number of API calls only, regardless of content length B. Number of tokens processed (input and/or output) C. Number of registered users D. Number of fine-tuning jobs run

> [!success]- Answer
> **B** — most FM pricing (including Bedrock's on-demand pricing) is token-based, so both prompt length and response length directly affect cost.

## Domain 3 – Applications of Foundation Models (Q30–47)

**30.** Which Bedrock customization approach involves further training a model on your own labeled input-output examples to change its behavior for a narrow task?
A. Prompt engineering B. Fine-tuning C. Retrieval-Augmented Generation D. Guardrails configuration

> [!success]- Answer
> **B** — fine-tuning further trains a model on your own labeled examples, changing the model's learned behavior for a specific task, unlike RAG (which grounds answers in external data without changing weights).

**31.** Amazon Bedrock's Custom Model Import feature is used to:
A. Import third-party foundation models you've already fine-tuned elsewhere into Bedrock for unified access B. Import your AWS billing data into a model C. Import IAM policies into a model D. Import CloudWatch logs for analysis

> [!success]- Answer
> **A** — Custom Model Import lets you bring your own already-trained/fine-tuned model weights into Bedrock, so you can invoke them through the same managed Bedrock API as built-in models.

**32.** SageMaker JumpStart is primarily used to:
A. Launch EC2 instances faster B. Provide a hub of pre-built, pre-trained models and solution templates to accelerate ML projects C. Automatically write IAM policies D. Encrypt training data at rest

> [!success]- Answer
> **B** — JumpStart gives quick access to pre-trained models and prebuilt solution templates, reducing the time to get a working ML solution started.

**33.** SageMaker Canvas is best described as:
A. A no-code visual interface for building ML models without writing code B. A vector database C. A container orchestration service D. A CI/CD pipeline tool for ML

> [!success]- Answer
> **A** — Canvas gives business analysts a no-code, visual way to build and use ML models, without requiring ML/coding expertise.

**34.** SageMaker Model Monitor is used to:
A. Train new models automatically B. Continuously monitor deployed models for data quality drift and performance degradation C. Generate synthetic training data D. Manage IAM roles for SageMaker

> [!success]- Answer
> **B** — Model Monitor watches production model inputs/outputs over time, flagging drift or quality degradation after deployment.

**35.** SageMaker Pipelines is used to:
A. Provide a managed vector store B. Orchestrate and automate the ML workflow (build, train, deploy) as a repeatable CI/CD-style pipeline C. Translate text between languages D. Detect PII in documents

> [!success]- Answer
> **B** — Pipelines automates and versions the steps of an ML workflow, similar in spirit to CI/CD but for model build/train/deploy stages.

**36.** Amazon Kendra is best described as:
A. A managed, ML-powered enterprise search service B. A speech synthesis engine C. A container registry D. A model training service

> [!success]- Answer
> **A** — Kendra is a managed enterprise search service using ML to return more relevant results than keyword search, and can also serve as a retriever behind a RAG application.

**37.** Bedrock's Model Evaluation feature is used to:
A. Encrypt model weights B. Compare foundation model outputs against each other or against ground truth, via automatic and/or human evaluation C. Bill customers for model usage D. Manage IAM permissions

> [!success]- Answer
> **B** — Model Evaluation lets you run automatic metric-based or human-review evaluation jobs to compare candidate models/outputs before choosing one for production.

**38.** AWS Trainium and AWS Inferentia are:
A. Foundation models available in Bedrock B. Custom AWS-designed chips optimized for ML training (Trainium) and inference (Inferentia) C. IAM policy types D. Amazon SageMaker algorithm names

> [!success]- Answer
> **B** — Trainium is AWS's custom chip optimized for training workloads, Inferentia for inference workloads — both aimed at improving price/performance over general-purpose GPUs for ML at scale.

**39.** Textract's "Analyze Document" API differs from "Detect Document Text" in that Analyze Document additionally:
A. Translates the document B. Extracts structured data like forms and tables, not just raw text C. Generates a summary of the document D. Converts the document to speech

> [!success]- Answer
> **B** — Detect Document Text is OCR-only (raw text extraction); Analyze Document adds structured extraction of forms (key-value pairs) and tables.

**40.** Amazon Rekognition Custom Labels is used to:
A. Train a custom image classification or object detection model on your own labeled images B. Translate labels between languages C. Generate synthetic images D. Detect PII in text documents

> [!success]- Answer
> **A** — Custom Labels lets you train Rekognition on your own labeled image dataset for domain-specific detection/classification beyond its built-in general labels.

**41.** Amazon Comprehend Custom Classification is used to:
A. Classify images by content B. Train a custom text classifier on your own labeled text categories C. Detect faces in video D. Generate speech from text

> [!success]- Answer
> **B** — Custom Classification lets you train Comprehend on your own labeled text categories, beyond its built-in sentiment/entity detection.

**42.** Amazon Translate supports which translation modes?
A. Real-time (synchronous) only B. Batch (asynchronous) only C. Both real-time and batch translation D. Neither — it requires a custom-trained model first

> [!success]- Answer
> **C** — Translate supports both real-time translation for interactive use cases and batch/asynchronous translation for large document sets.

**43.** In Amazon Lex, "slots" refer to:
A. The chatbot's overall conversation goal B. The specific pieces of information needed to fulfill a user's intent (e.g. date, location) C. A synonym for "intent" D. The underlying foundation model powering the bot

> [!success]- Answer
> **B** — an "intent" is the user's overall goal (e.g. "book a flight"); "slots" are the specific parameters needed to fulfill that intent (e.g. departure city, date).

**44.** Amazon Personalize handles the "cold start" problem (a brand-new user or item with no interaction history) primarily by:
A. Refusing to generate any recommendations B. Falling back to recommendations based on available metadata rather than historical interactions C. Waiting 30 days before serving any recommendations D. Always recommending the single most popular item

> [!success]- Answer
> **B** — Personalize can use item/user metadata (category, attributes) to generate reasonable recommendations even without interaction history, rather than being unable to recommend anything at all.

**45.** The distinction between Amazon Q Business and Amazon Q Developer is:
A. There is no distinction, they are the same product B. Q Business is a GenAI assistant for business/work data and tasks; Q Developer is focused on coding assistance C. Q Business only works with AWS billing data D. Q Developer only works with images

> [!success]- Answer
> **B** — Q Business targets enterprise knowledge/work tasks (grounded in your company's data); Q Developer targets software development tasks (code generation, debugging, AWS-specific coding help).

**46.** When selecting a foundation model in Bedrock for a production application, which factor is generally NOT a primary selection consideration?
A. Latency requirements B. Cost per token C. The specific EC2 instance type running your unrelated web servers D. Context window size needed for the use case

> [!success]- Answer
> **C** — model selection depends on capability, latency, cost, context window, and modality fit for the task; the instance type of unrelated infrastructure has no bearing on foundation model choice.

**47.** A company needs a chatbot to answer questions using their constantly-updated internal wiki, without retraining a model every time the wiki changes. The best-fit approach is:
A. Fine-tuning a new model version every time the wiki updates B. Retrieval-Augmented Generation (RAG) via a Knowledge Base pointed at the wiki content C. Increasing the model's temperature D. Using a smaller foundation model

> [!success]- Answer
> **B** — RAG grounds responses in current external data at query time, so wiki updates are reflected immediately without any retraining — exactly the scenario fine-tuning is a poor fit for.

## Domain 4 – Guidelines for Responsible AI (Q48–56)

**48.** A "model card" is best described as:
A. A payment method for AWS billing B. Standardized documentation describing a model's intended use, limitations, training data, and performance characteristics C. A physical hardware component D. A type of IAM credential

> [!success]- Answer
> **B** — a model card is documentation that transparently communicates what a model is for, how it performs, and where its limitations lie, supporting informed and responsible use.

**49.** Detecting and filtering toxic or harmful generated content is primarily a concern of which responsible AI dimension?
A. Cost optimization B. Safety C. Data residency D. Model latency

> [!success]- Answer
> **B** — filtering toxic, harmful, or offensive output is a core part of the "safety" dimension of responsible AI, commonly implemented via guardrails/content filters.

**50.** Data poisoning refers to:
A. Encrypting training data B. Deliberately corrupting or manipulating training data to bias or compromise a model's behavior C. Deleting unused training data D. A normal part of the data cleaning process

> [!success]- Answer
> **B** — data poisoning is an adversarial attack where training data is deliberately manipulated to introduce bias, backdoors, or degraded performance into the resulting model.

**51.** "Inclusivity" in the context of responsible AI dataset practices refers to:
A. Including as much data as possible regardless of quality B. Ensuring training data represents diverse populations to reduce skewed or unfair outcomes C. Including only data from a single demographic for consistency D. A synonym for data encryption

> [!success]- Answer
> **B** — inclusivity means training data should represent the diversity of the population the model will affect, reducing the risk of the model performing poorly or unfairly for underrepresented groups.

**52.** Which Bedrock Guardrails capability specifically helps prevent sensitive personal information from appearing in model output?
A. Denied topics B. PII redaction C. Latency optimization D. Model versioning

> [!success]- Answer
> **B** — Guardrails support PII detection and redaction policies, specifically targeting personal data appearing in generated output, distinct from denied-topics filtering.

**53.** "Robustness" as a responsible AI dimension refers to:
A. How fast a model responds B. A model's ability to maintain reliable performance under edge cases, noisy input, or adversarial conditions C. How large a model's parameter count is D. How many AWS Regions a model is deployed in

> [!success]- Answer
> **B** — robustness is about the model continuing to behave reliably and predictably even under unusual, noisy, or adversarial inputs, not just on clean, expected data.

**54.** "Veracity" as one of AWS's core responsible AI dimensions refers to:
A. How quickly a model was trained B. The truthfulness/factual accuracy of a model's outputs C. The legal jurisdiction governing the model D. The model's storage cost

> [!success]- Answer
> **B** — veracity concerns whether a model's outputs are factually accurate and truthful, directly related to (but broader than) the specific problem of hallucination.

**55.** "Controllability" as a responsible AI dimension refers to:
A. The ability to monitor, guide, and intervene in a model's behavior (e.g. via guardrails or human oversight) B. The model's inference cost C. The number of API keys issued D. The size of the training dataset

> [!success]- Answer
> **A** — controllability is about having mechanisms (guardrails, human-in-the-loop review, override capability) to guide or stop a model's behavior, not letting it act unchecked.

**56.** A hiring-screening model is found to reject qualified candidates from a specific demographic at a higher rate than others, despite similar qualifications. This is a violation of which responsible AI dimension?
A. Latency B. Fairness C. Cost efficiency D. Explainability

> [!success]- Answer
> **B** — this is a fairness violation: the model's outcomes are systematically skewed against a specific group, regardless of intent, which is exactly what the fairness dimension addresses.

## Domain 5 – Security, Compliance, and Governance for AI Solutions (Q57–65)

**57.** Encryption at rest protects data:
A. As it travels between a client and a server B. While it is stored on disk C. Only inside application memory D. Only during the TLS handshake

> [!success]- Answer
> **B** — encryption at rest protects stored data (e.g. on disk, in S3, in a database), complementing encryption in transit, which protects data while it's moving over a network.

**58.** The difference between an IAM role and an IAM user is:
A. There is no difference B. A role is an identity assumed temporarily (e.g. by a service or federated user) without long-term credentials; a user has persistent, long-term credentials C. Roles are only for AWS employees D. Users can only be created via the CLI

> [!success]- Answer
> **B** — an IAM role is assumed temporarily and doesn't have permanent credentials tied to it (commonly used by services, applications, or federated identities); an IAM user has its own long-term credentials.

**59.** AWS Config is primarily used to:
A. Encrypt data at rest B. Track and evaluate AWS resource configurations for compliance over time C. Translate text between languages D. Train foundation models

> [!success]- Answer
> **B** — Config continuously records resource configurations and evaluates them against rules, helping track compliance drift over time.

**60.** Amazon Macie is used to:
A. Detect and classify sensitive data (like PII) stored in Amazon S3 using ML B. Train custom foundation models C. Manage IAM policies D. Load-balance API traffic

> [!success]- Answer
> **A** — Macie uses ML to automatically discover, classify, and help protect sensitive data (such as PII) stored in S3.

**61.** Using a VPC endpoint to access Amazon Bedrock provides which specific security benefit?
A. Faster model inference speed B. Private connectivity to Bedrock without traversing the public internet C. Automatic model fine-tuning D. Free API usage

> [!success]- Answer
> **B** — a VPC endpoint (via AWS PrivateLink) allows traffic to reach Bedrock privately within the AWS network, without going over the public internet, reducing exposure.

**62.** AWS Artifact is best described as:
A. A model training service B. A self-service portal for accessing AWS compliance reports and agreements (e.g. SOC, ISO, PCI) C. A container image registry D. A vector database

> [!success]- Answer
> **B** — Artifact provides on-demand access to AWS's compliance documentation and agreements, useful for audits and regulatory requirements.

**63.** A company must ensure customer data used in a GenAI application never leaves the European Union, per regulatory requirements. This is primarily addressed by:
A. Increasing the model's context window B. Choosing an AWS Region within the EU and applying appropriate data residency controls C. Disabling CloudTrail D. Using a smaller foundation model

> [!success]- Answer
> **B** — data residency requirements are addressed by deliberately selecting AWS Regions within the required geography and applying controls to keep data (and processing) within that boundary.

**64.** Enabling Bedrock model invocation logging allows a company to:
A. Automatically fine-tune models based on usage B. Capture and store the inputs and outputs of model invocations (e.g. to S3/CloudWatch) for audit and monitoring purposes C. Reduce inference cost D. Bypass Guardrails for trusted users

> [!success]- Answer
> **B** — invocation logging captures request/response data from Bedrock model calls into S3 and/or CloudWatch Logs, supporting audit trails, debugging, and compliance monitoring.

**65.** Multi-factor authentication (MFA) primarily strengthens security by:
A. Encrypting data at rest automatically B. Requiring an additional verification factor beyond just a password, reducing the risk from compromised credentials alone C. Replacing the need for IAM policies D. Automatically rotating encryption keys

> [!success]- Answer
> **B** — MFA adds a second independent verification factor (e.g. a one-time code) beyond a password, so a compromised password alone isn't sufficient to gain access.

## Next
40 - Mock Exam 3 — a third timed pass; per the [15-Day Exam Countdown](15-Day Exam Countdown.md), the value at this point is repeated timed-pressure practice and a shrinking Missed Questions Log, not novelty.
