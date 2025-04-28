<script setup lang="ts">
import { Modal } from "bootstrap";
import { onMounted, onUnmounted, reactive, ref } from "vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import OrdersService from "../../../services/OrdersService";
import { useAuthStore } from "../../../core/stores/auth";
import { AxiosError } from "axios";
import { useLoading } from "vue-loading-overlay";
import type { Orders } from "../../../core/types/orders";
import { DateTime } from "luxon";
import { io } from "socket.io-client";
import { useWebNotification, type UseWebNotificationOptions } from "@vueuse/core";
import Swal from "sweetalert2";

const authStore = useAuthStore();
const ordersService = new OrdersService();
const $loading = useLoading();

const form = reactive({
  namaPelanggan: "",
  alamatPelanggan: "",
  noHpPelanggan: "",
  keterangan: "",
  fotoHp: [] as File[],
});

const mediaType = [
  "arrival",
  "bongkar",
  "before",
  "after",
  "video",
  "qc",
] as const;
const mediaTypeLabel = {
  arrival: "Kedatangan",
  bongkar: "Bongkar",
  before: "Sebelum",
  after: "Sesudah",
  video: "Video",
  qc: "QC",
};

const state = reactive({
  modalAdd: {} as Modal,
  modalDetail: {} as Modal,
  socketStatus: false,
});

const orders = ref([] as Orders[]);

const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

const socket = io(baseApiUrl + '/notifications', {
  extraHeaders: {
    Authorization: `Bearer ${authStore.jwtToken}`,
  },
});

function handleFileChange(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  if (!event.target.files) {
    return;
  }

  // limit to 5 files
  if (form.fotoHp.length + event.target.files.length > 5) {
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
    form.fotoHp.push(event.target.files[i]);
  }
}

function createObjectURL(file: File) {
  return window.URL.createObjectURL(file);
}

function removeFotoHp(index: number) {
  form.fotoHp.splice(index, 1);
}

async function getOrders(status?: string) {
  try {
    const response = await ordersService.getAllOrders({
      headers: {
        Authorization: `Bearer ${authStore.jwtToken}`,
      },
    });

    orders.value = response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        await authStore.refresh().catch(() => {
          return;
        });

        return getOrders(status);
      }
    }

    toast.error("Gagal mengambil data pesanan", {
      autoClose: 3000,
    });
  }
}

async function createOrder() {
  if (
    form.namaPelanggan === "" ||
    form.alamatPelanggan === "" ||
    form.noHpPelanggan === "" ||
    form.keterangan === "" ||
    form.fotoHp.length === 0
  ) {
    toast.error("Semua field harus diisi");
    return;
  }

  state.modalAdd.hide();
  const $loader = $loading.show({
    isFullPage: true,
    loader: "dots",
    color: "#4B5563",
    opacity: 0.5,
    zIndex: 9999,
  });
  try {
    const formData = new FormData();
    formData.append("nama_pelanggan", form.namaPelanggan);
    formData.append("alamat_pelanggan", form.alamatPelanggan);
    formData.append("no_hp_pelanggan", form.noHpPelanggan);
    formData.append("keterangan", form.keterangan);
    for (let i = 0; i < form.fotoHp.length; i++) {
      formData.append("fotoHp[]", form.fotoHp[i]);
    }

    await ordersService.createOrder(formData, {
      headers: {
        Authorization: `Bearer ${authStore.jwtToken}`,
        contentType: "multipart/form-data",
      },
    });

    toast.success("Berhasil menambahkan pesanan");
    getOrders();
    $loader.hide();
    state.modalAdd.hide();
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        await authStore.refresh().catch(() => {
          $loader.hide();
          state.modalAdd.hide();
          return Promise.reject();
        });
        return createOrder();
      }
    }

    toast.error("Gagal menambahkan pesanan");
  }

  $loader.hide();
}

async function deleteOrder(id: number) {
  Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data yang dihapus tidak dapat dikembalikan",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await ordersService.deleteOrder(id, {
          headers: {
            Authorization: `Bearer ${authStore.jwtToken}`,
          },
        });

        toast.success("Berhasil menghapus pesanan");
        getOrders();
      } catch (error) {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            await authStore.refresh().catch(() => {
              return;
            });
            return deleteOrder(id);
          }
        }

        toast.error("Gagal menghapus pesanan");
      }
    }
  })
}

const selectedOrder = ref<Orders | null>(null);

async function detailOrder(order: Orders) {
  selectedOrder.value = order;
  state.modalDetail.show();
}

function calculateTimeDifference(date: string) {
  const createdDate = DateTime.fromISO(date);
  const currentDate = DateTime.now();

  const diffMinutes = currentDate.diff(createdDate, "minutes").minutes;

  if (diffMinutes <= 1) {
    return 0;
  } else if (diffMinutes > 1 && diffMinutes <= 5) {
    return 1;
  } else {
    return 2;
  }
}

const transferKTTitemout: UseWebNotificationOptions = {
  title: "Transfer Order Timeout",
  dir: "auto",
  lang: "id",
  body: "Transfer order ke kepala teknisi timeout",
  tag: "transfer_timeout_kt",
  requestPermissions: true,
  renotify: true,
}

onMounted(() => {
  try {
    state.modalAdd = Modal.getOrCreateInstance("#modalAdd");
    state.modalDetail = Modal.getOrCreateInstance("#modalDetail");
  } catch (e) {
    console.log(e);
  }
  getOrders();

  setInterval(() => {
    getOrders();
  }, 180000);

  socket.on('connect', () => {
    state.socketStatus = true;
  })

  socket.on("disconnect", () => {
    state.socketStatus = false;
  });

  socket.on("order.transfer_timeout_kt", (payload) => {
    toast.error(`Transfer order ${payload} ke kepala teknisi timeout`);
    transferKTTitemout.body = `Transfer order ${payload} ke kepala teknisi timeout`;
    useWebNotification(transferKTTitemout).show();
    getOrders();
  })
});

onUnmounted(() => {
  socket.disconnect();
});

</script>
<template>
  <div class="page-heading">
    <h3>Pesanan</h3>
  </div>
  <div class="page-content">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <div class="d-flex justify-content-end">
              <button class="btn btn-primary" @click="state.modalAdd.show()">
                Tambah Pesanan
              </button>
            </div>
          </div>
          <div class="card-body">
            <table class="table table-bordered">
              <thead>
                <tr>
                  <th>No</th>
                  <th>No. Order</th>
                  <th>Nama Pelanggan</th>
                  <th>Status</th>
                  <th>Kepala Teknisi</th>
                  <th>Teknisi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(order, index) in orders"
                  :key="index"
                  :class="[
                  {
                    'bg-success': !order.kepala_teknisi && calculateTimeDifference(order.createdAt.toString()) === 0,
                    'bg-warning': !order.kepala_teknisi && calculateTimeDifference(order.createdAt.toString()) === 1,
                    'bg-danger': !order.kepala_teknisi && calculateTimeDifference(order.createdAt.toString()) === 2,
                    'border-top': true,
                  }
                  ]"
                >
                <td 
                  :class="
                  order.status === 'draft' ? 'text-white' : ''
                  "
                  class="fw-bold">{{ index + 1 }}</td>
                  <td 
                  :class="order.status === 'draft' ? 'text-white' : ''"
                  class="fw-bold">{{ order.no_order }}</td>
                  <td
                  :class="order.status === 'draft' ? 'text-white' : ''"
                  class="fw-bold">{{ order.nama_pelanggan }}</td>1
                  <td
                  :class="order.status === 'draft' ? 'text-white' : ''"
                  class="fw-bold">{{ order.status }}</td>
                  
                  <td>
                  <span
                    class="badge"
                    :class="order.kepala_teknisi ? 'bg-success' : 'bg-purple'"
                  >
                    {{
                    order.kepala_teknisi
                      ? order.kepala_teknisi.username
                      : "Belum Ada"
                    }}
                  </span>
                  </td>
                  <td>
                  <span
                    class="badge"
                    :class="order.teknisi ? 'bg-success' : 'bg-purple'"
                  >
                    {{ order.teknisi ? order.teknisi.username : "Belum Ada" }}
                  </span>
                  </td>
                  <td>
                  <button
                    class="btn btn-primary me-2"
                    @click="detailOrder(order)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                  v-if="order.status === 'draft' || !order.kepala_teknisi || !order.teknisi"
                  class="btn btn-danger bg-purple" @click="deleteOrder(order.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalAdd" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Tambah Pesanan</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="customerName" class="form-label">Nama Pelanggan</label>
            <input
              type="text"
              class="form-control"
              id="customerName"
              v-model="form.namaPelanggan"
            />
          </div>
          <div class="mb-3">
            <label for="customerAddress">Alamat Pelanggan</label>
            <textarea
              class="form-control"
              id="customerAddress"
              v-model="form.alamatPelanggan"
            ></textarea>
          </div>
          <div class="mb-3">
            <label for="customerPhone" class="form-label"
              >No. HP Pelanggan</label
            >
            <input
              type="text"
              class="form-control"
              id="customerPhone"
              v-model="form.noHpPelanggan"
            />
          </div>
          <div class="mb-3">
            <label for="description" class="form-label"
              >Keterangan Kerusakan</label
            >
            <textarea
              class="form-control"
              id="description"
              v-model="form.keterangan"
            ></textarea>
          </div>
          <div class="mb-3">
            <label for="foto_hp">Foto HP</label>
            <input
              type="file"
              class="form-control"
              id="foto_hp"
              multiple
              accept="image/*"
              @change="handleFileChange"
            />
          </div>
          <div class="mt-3" v-if="form.fotoHp.length > 0">
            <div
              v-for="(file, index) in form.fotoHp"
              :key="index"
              class="position-relative d-inline-block me-2 ms-2"
            >
              <img
                :src="createObjectURL(file)"
                class="object-fit-cover"
                style="width: 100px; height: 100px"
              />
              <button
                @click="removeFotoHp(index)"
                class="position-absolute top-0 end-0 bg-transparent hover-bg-transparent text-white fw-bold p-1 rounded"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Batal
          </button>
          <button type="button" class="btn btn-primary" @click="createOrder">
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalDetail" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Detail Pesanan</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedOrder">
            <div class="mb-3">
              <label>No Order:</label>
              <div>{{ selectedOrder.no_order }}</div>
            </div>
            <div class="mb-3">
              <label>Nama Pelanggan:</label>
              <div>{{ selectedOrder.nama_pelanggan }}</div>
            </div>
            <div class="mb-3">
              <label>Alamat Pelanggan:</label>
              <div>{{ selectedOrder.alamat_pelanggan }}</div>
            </div>
            <div class="mb-3">
              <label>No HP Pelanggan:</label>
              <div>{{ selectedOrder.no_hp_pelanggan }}</div>
            </div>
            <div class="mb-3">
              <label>Keterangan:</label>
              <div>{{ selectedOrder.keterangan }}</div>
            </div>
            <div class="mb-3">
              <label>Status:</label>
              <div>{{ selectedOrder.status }}</div>
            </div>
            <div class="mb-3" v-if="selectedOrder.fotoHp">
              <label>Foto HP:</label>
              <div v-for="type in mediaType" :key="type">
                <div v-if="selectedOrder.fotoHp[type]" class="mb-2">
                  <h6>{{ mediaTypeLabel[type] }}</h6>
                  <viewer :options="{ toolbar: true }">
                    <div class="d-flex flex-wrap">
                      <div
                        v-for="(file, index) in selectedOrder.fotoHp[type]"
                        :key="index"
                        class="position-relative d-inline-block me-2 ms-2"
                      >
                        <img
                          :src="baseApiUrl + '/' + file.path"
                          class="object-fit-cover"
                          style="width: 100px; height: 100px; cursor: pointer"
                        />
                      </div>
                    </div>
                  </viewer>
                </div>
              </div>
            </div>
            <div v-else>
              <p>Loading...</p>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  .bg-purple {
    background-color: var(--bs-purple);
  }
</style>