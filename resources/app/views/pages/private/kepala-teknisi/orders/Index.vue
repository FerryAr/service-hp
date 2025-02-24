<script lang="ts" setup>
import Page from "@/views/layouts/Page.vue";
import OrderService from "@/services/OrderService";
import { onMounted, ref, inject } from "vue";
import Modal from "@/views/components/Modal.vue";
import Panel from "@/views/components/Panel.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import type { Orders } from "@/stub/types/orders";
import { DateTime } from "luxon";
import LaravelEcho from "laravel-echo";


const orderService = new OrderService();
const records = ref([] as Orders[]);
const actions = ref([]);
const sorting = ref({});
const isLoading = ref(true);

function initWS() {
    const echo = inject<LaravelEcho<any>>("echo");
    if (echo) {
        echo.private("kepala_teknisi")
            .listen("OrderTransferredToKepala", (event) => {
                console.log("Order transferred event:", event);
                toast.warning(event.message);
                new Notification("Pesanan Masuk!", {
                    body: event.message,
                });
                fetchOrders();
            });
    }
}

function fetchOrders() {
    orderService.listOrders().then((response) => {
        records.value = response.data;
        isLoading.value = false;
    });
}

onMounted(() => {
    fetchOrders();
    initWS();
});

function onPageChanged(page) {
    console.log("Page changed to:", page);
}

function onAction(params) {
    console.log("Action clicked:", params);
}

function onSort(params) {
    console.log("Sort changed:", params);
}

function createObjectURL(file) {
    return window.URL.createObjectURL(file);
}



function calculateTimeDifference(date: Date) {
    // use luxon to calculate time difference
    const createdDate = DateTime.fromJSDate(date);
    const currentDate = DateTime.now();

    const diff = currentDate.diff(createdDate, ["minutes"]).toObject();
    if (diff.minutes <= 1) {
        return 0;
    } else if (diff.minutes > 1 && diff.minutes <= 5) {
        return 1;
    } else {
        return 2;
    }
}
</script>

<template>
    <Page>
        <div class="flex justify-between mb-4">
            <div><h3 class="text-lg font-semibold">Pesanan</h3></div>
        </div>
        <div class="overflow-x-auto">
            <table
                class="min-w-full bg-white shadow-md rounded-lg overflow-hidden"
            >
                <thead class="bg-blue-500 text-white">
                    <tr>
                        <th class="w-1/12 p-3 text-left uppercase font-semibold text-sm">
                            No
                        </th>
                        <th class="w-2/12 p-3 text-left uppercase font-semibold text-sm">
                            No. Order
                        </th>
                        <th class="w-2/12 p-3 text-left uppercase font-semibold text-sm">
                            Status Order
                        </th>
                        <th class="w-2/12 p-3 text-left uppercase font-semibold text-sm">
                            Kepala Teknisi
                        </th>
                        <th class="w-2/12 p-3 text-left uppercase font-semibold text-sm">
                            Teknisi
                        </th>
                        <th class="w-3/12 p-3 text-left uppercase font-semibold text-sm">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(record, index) in records"
                        :key="index"
                        :class="{
                            'bg-green-500':
                                calculateTimeDifference(record.created_at) ===
                                0,
                            'bg-yellow-500':
                                calculateTimeDifference(record.created_at) ===
                                1,
                            'bg-red-500':
                                calculateTimeDifference(record.created_at) ===
                                2,
                            'border-t': true,
                            'hover:bg-gray-100': true,
                            'text-white': true,
                            'hover:text-black': true,
                        }"
                    >
                        <td class="p-3 ">{{ index + 1 }}</td>
                        <td class="p-3">{{ record.no_order }}</td>
                        <td class="p-3">{{ record.status }}</td>
                        <td class="p-3">
                            <span
                                v-if="record.kepala_teknisi"
                                class="bg-green-500 text-gray-300 text-xs font-bold px-2 py-1 rounded"
                            >
                                {{ record.kepala_teknisi }}
                            </span>
                            <span
                                v-else
                                class="bg-purple-500 text-gray-300 text-xs font-bold px-2 py-1 rounded"
                            >
                                Belum ada
                            </span>
                        </td>
                        <td class="p-3">
                            <span
                                v-if="record.teknisi"
                                class="bg-green-500 text-gray-300 text-xs font-bold px-2 py-1 rounded"
                            >
                                {{ record.teknisi }}
                            </span>
                            <span
                                v-else
                                class="bg-purple-500 text-gray-300 text-xs font-bold px-2 py-1 rounded"
                            >
                                Belum ada
                            </span>
                        </td>
                        <td class="p-3">
                            <button
                                class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-2 py-1 rounded mr-1"
                            >
                                View
                            </button>
                           
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Page>
</template>
