
import os
import base64
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline, GPT2LMHeadModel,GPT2Tokenizer
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import HuggingFacePipeline
from langchain.chains import RetrievalQA
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


checkpoint = "gpt2"
print(f"Checkpoint path: {checkpoint}")
tokenizer = GPT2Tokenizer.from_pretrained(checkpoint)
base_model = GPT2LMHeadModel.from_pretrained(
    checkpoint,
    device_map=device,
    torch_dtype=torch.float32
)

tokenizer.pad_token_id = tokenizer.eos_token_id

persist_directory = "db"

loader = TextLoader('ThripitakaQuest_BackEnd\\app\statics\\tipitaka.txt', encoding="utf-8")
documents = loader.load()
text_splitter = RecursiveCharacterTextSplitter(chunk_size=100, chunk_overlap=100)
texts = text_splitter.split_documents(documents)
# create embeddings here
embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
# create vector store here
db = Chroma.from_documents(texts, embeddings, persist_directory=persist_directory)
db.persist()
db = None


def llm_pipeline():
    pipe = pipeline(
        'text-generation',
        model=base_model,
        tokenizer=tokenizer,
        max_length=500,
        do_sample=True,
        temperature=0.3,
        top_p=0.90,
        num_workers=2,
    )
    local_llm = HuggingFacePipeline(pipeline=pipe)
    return local_llm


def qa_llm():
    llm = llm_pipeline()
    embeddings = SentenceTransformerEmbeddings(model_name="all-MiniLM-L6-v2")
    db = Chroma(persist_directory=persist_directory, embedding_function=embeddings)
    retriever = db.as_retriever()
    qa = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        return_source_documents=True
    )
    return qa


def process_answer(instruction):
    response = ''
    instruction = instruction
    qa = qa_llm()
    generated_text = qa(instruction)
    answer = generated_text['result']
    return answer


# user_input = ""
# answer = process_answer({'query': user_input})
# print(answer)

# app/chatbot.py

from flask import Blueprint, jsonify, request
from flask_cors import CORS

chat_bot = Blueprint('chat_bot', __name__)
CORS(chat_bot)

@chat_bot.route('/ask', methods=["POST"])
def ask():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'success'})
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    try:
        data = request.get_json()
        user_input = data.get('query', '')
        if not user_input:
            return jsonify({'response': "Please provide a question"}),400
        
        answer = process_answer({'query': user_input})
        response = jsonify({'response': answer})
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        print(answer)
        return response

    except Exception as e:
        return jsonify({'error': str(e)})
