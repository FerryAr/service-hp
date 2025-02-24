import { createApp } from "vue";
import { createPinia } from "pinia";
import LaravelEcho from "laravel-echo";
import axios from "axios";
import Pusher from "pusher-js";

import router from "@/router";
import i18n from "@/plugins/i18n";
import App from "@/App";


const app = createApp(App);
const echo = new LaravelEcho({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    enabledTransports: ["ws", "wss"],
    authorizer: (channel) => {
        return {
            authorize: (
                socketId,
                callback
            ) => {
                axios
                    .post("/broadcasting/auth", {
                        socket_id: socketId,
                        channel_name: channel.name,
                    })
                    .then((response) => {
                        callback(false, response.data);
                    })
                    .catch((error) => {
                        callback(true, error);
                    });
            },
        };
    },
    // client: new Pusher(import.meta.env.VITE_REVERB_APP_KEY, {
    //     wsHost: import.meta.env.VITE_REVERB_HOST,
    //     wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    //     wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    //     cluster: import.meta.env.VITE_REVERB_APP_CLUSTER,
    //     forceTLS: import.meta.env.VITE_REVERB_SCHEME === "https",
    // }),
});

app.config.globalProperties.$echo = echo;
app.provide("echo", echo);

app.use(createPinia());

app.use(router);
app.use(i18n);

app.mount("#app");
