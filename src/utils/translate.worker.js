import { pipeline } from '@xenova/transformers';

class MyTranslationPipeline {
    static task = 'translation';
    static model = 'Xenova/nllb-200-distilled-600M';
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            try {
                this.instance = await pipeline(this.task, this.model, { progress_callback });
                console.log("Model loaded successfully");
            } catch (error) {
                console.error("Error loading model:", error);
            }
        }
    
        return this.instance;
    }
    
}

self.addEventListener('message', async (event) => {
    console.log("Message received in worker:", event.data);
    let translator = await MyTranslationPipeline.getInstance(x => {
        self.postMessage(x);
    });
    console.log("Translator instance:", translator);

    try {
        let output = await translator(event.data.text, {
            tgt_lang: event.data.tgt_lang,
            src_lang: event.data.src_lang,
            callback_function: x => {
                self.postMessage({
                    status: 'update',
                    output: translator.tokenizer.decode(x[0].output_token_ids, { skip_special_tokens: true })
                });
            }
        });

        console.log('Translation output:', output);
        self.postMessage({
            status: 'complete',
            output
        });
    } catch (error) {
        console.error("Error during translation:", error);
        self.postMessage({
            status: 'error',
            message: error.message
        });
    }
});
