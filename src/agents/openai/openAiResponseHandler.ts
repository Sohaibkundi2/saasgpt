import OpenAI from "openai";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Channel, Event, MessageResponse, StreamChat } from "stream-chat";

export class OpenAIresponseHandler {
    private message_text = ""
    private chunk_counter = 0
    run_id = ""
    is_done = false
    last_update_time = 0

    constructor(
        private readonly openai: OpenAI,
        private readonly openAiThread: OpenAI.Beta.Threads.Thread,
        private readonly channel: Channel,
        private readonly assistantStream: AssistantStream,
        private readonly chatClient: StreamChat,
        private readonly message: MessageResponse,
        private readonly onDispose: () => void
    ) {
        this.chatClient.on("ai_indicator.stop", this.handleStopGenerating)



    }

    run = async () => {
    }
    dispose = async () => {
    }
    private handleStopGenerating = async (event: Event) => {
    }
    private handleStreamChat = async (event: Event) => {
    }
    private handleError = async (error: Error) => {

        if (this.is_done) {
            return
        }
        await this.channel.sendEvent({
            type: "ai_indicator.update",
            ai_state: "AI_STATE_ERROR",
            cid: this.message.cid,
            message_id: this.message.id
        })

        await this.chatClient.partialUpdateMessage(
            this.message.id,
            {
                set: {
                    text: error.message || "Error occurred while processing your request.",
                    message: error.toString(),
                }
            }
        )
        this.dispose()
    }
    private performWebSearch = async (query: string): Promise<string> => {

        const TAVILY_API_KEY = process.env.TAVILY_API_KEY

        if (!TAVILY_API_KEY) {
            console.log("Cannot perform web search because tavily api key is missing")

            return JSON.stringify({
                error: "Cannot perform web search because tavily api key is missing"
            })
        }

        try {
            const response = await fetch("https://api.tavily.com/search", {
                method: "POST",
                headers: {
                    "Content_Type": "application/json",
                    "Authorization": `Bearer ${TAVILY_API_KEY}`
                },
                body: JSON.stringify({
                    query: query,
                    search_depth: "advanced",
                    include_answers: true,
                    max_result: 5,
                    include_raw_content: false

                })
            })

            if (!response.ok) {
                const errorText = response.text()
                console.error(`failed while search for query ": ${query}`)
                return JSON.stringify({
                    error: `failed while search for query. status: " ${response.status}`,
                    details: errorText
                })
            }

            const data = response.json()
            console.log(`Tavily search successful for query : ${query}`)

            return JSON.stringify(data)
        } catch (error) {
            console.error(`An exceptional error occured while searching for query ": ${query}`)
            return JSON.stringify({
                error: "An exceptional error occured while searching for query"
            })
        }
    }
}