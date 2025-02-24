<script lang="ts" setup>
import Page from "@/views/layouts/Page.vue";
import OrderService from "@/services/OrderService";
import { onMounted, ref } from "vue";
import Modal from "@/views/components/Modal.vue";
import Panel from "@/views/components/Panel.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import type { Orders } from "@/stub/types/orders";
import { DateTime } from "luxon";

const orderService = new OrderService();
const records = ref([] as Orders[]);
const actions = ref([]);
const sorting = ref({});
const isLoading = ref(true);

const namaPelanggan = ref("");
const alamatPelanggan = ref("");
const noHpPelanggan = ref("");
const fotoHp = ref([]);
const keteranganKerusakan = ref("");

const showModalAdd = ref(false);

function fetchOrders() {
    orderService.listOrders().then((response) => {
        records.value = response.data;
        console.log(records.value);
        isLoading.value = false;
    });
}

onMounted(() => {
    fetchOrders();
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

function handleCloseAddModal() {
    showModalAdd.value = false;
}

function handleFileChange(event) {
    // limit to 5 files
    if (fotoHp.value.length + event.target.files.length > 5) {
        toast.error("Maksimal 5 file", {
            autoClose: 3000,
            position: "top-right",
        });
        return;
    }

    // append files to fotoHp
    for (let i = 0; i < event.target.files.length; i++) {
        // limit files size to 5MB
        if (event.target.files[i].size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB", {
                autoClose: 3000,
                position: "top-right",
            });
            return;
        }
        fotoHp.value.push(event.target.files[i]);
    }
}

function removeFotoHp(index) {
    fotoHp.value.splice(index, 1);
}

function createObjectURL(file) {
    return window.URL.createObjectURL(file);
}

async function createOrder() {
    // check if required fields are empty
    if (
        !namaPelanggan.value ||
        !alamatPelanggan.value ||
        !noHpPelanggan.value ||
        !keteranganKerusakan.value ||
        fotoHp.value.length === 0
    ) {
        toast.error("Semua field harus diisi", {
            autoClose: 3000,
            position: "top-right",
        });
        return;
    }

    const formData = new FormData();
    formData.append("nama_pelanggan", namaPelanggan.value);
    formData.append("alamat_pelanggan", alamatPelanggan.value);
    formData.append("no_hp_pelanggan", noHpPelanggan.value);
    formData.append("keterangan", keteranganKerusakan.value);
    for (let i = 0; i < fotoHp.value.length; i++) {
        formData.append("foto_hp[]", fotoHp.value[i]);
    }

    try {
        const response = await orderService.createOrder(formData);
        console.log(response);
        toast.success("Pesanan berhasil ditambahkan", {
            autoClose: 3000,
            position: "top-right",
        });
        handleCloseAddModal();
        fetchOrders();
    } catch (error) {
        console.error(error);
        toast.error("Gagal menambahkan pesanan", {
            autoClose: 3000,
            position: "top-right",
        });
    }
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
            <div>
                <button
                    @click="showModalAdd = true"
                    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Tambah Pesanan
                </button>
            </div>
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
                            <button
                                class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded mr-1"
                            >
                                Edit
                            </button>
                            <button
                                class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1 rounded"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Page>

    <Modal
        :isShowing="showModalAdd"
        @close="handleCloseAddModal"
        :showClose="true"
    >
        <div class="p-4">
            <div class="flex justify-between">
                <h3 class="text-lg font-semibold">Tambah Pesanan</h3>
            </div>
            <div class="mt-4">
                <Panel>
                    <div class="mb-3">
                        <label class="text-sm font-medium text-gray-700">
                            Nama Pelanggan
                        </label>
                        <input
                            type="text"
                            class="w-full p-2 border border-gray-300 rounded block"
                            v-model="namaPelanggan"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="text-sm font-medium text-gray-700">
                            Alamat Pelanggan
                        </label>
                        <textarea
                            class="w-full p-2 border border-gray-300 rounded block"
                            v-model="alamatPelanggan"
                        ></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="text-sm font-medium text-gray-700">
                            No. HP Pelanggan
                        </label>
                        <input
                            type="text"
                            class="w-full p-2 border border-gray-300 rounded block"
                            v-model="noHpPelanggan"
                        />
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700"
                            >Foto HP</label
                        >
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            @change="handleFileChange"
                            class="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:hover:bg-slate-200 file:focus:bg-slate-200 file:cursor-pointer"
                        />
                        <div class="mt-3" v-if="fotoHp.length > 0">
                            <div
                                v-for="(file, index) in fotoHp"
                                :key="index"
                                class="relative inline-block mr-2 mb-2"
                            >
                                <img
                                    :src="createObjectURL(file)"
                                    class="w-20 h-20 object-cover"
                                />
                                <button
                                    @click="removeFotoHp(index)"
                                    class="absolute top-0 right-0 bg-transparent hover:bg-transparent text-white font-bold p-1 rounded"
                                >
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700"
                            >Keterangan Kerusakan</label
                        >
                        <textarea
                            class="w-full p-2 border border-gray-300 rounded"
                            v-model="keteranganKerusakan"
                        ></textarea>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <button
                            @click="createOrder"
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Simpan
                        </button>
                    </div>
                </Panel>
            </div>
        </div>
    </Modal>
</template>
