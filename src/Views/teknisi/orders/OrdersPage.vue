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
import type { UseWebNotificationOptions } from "@vueuse/core";
import { useWebNotification } from "@vueuse/core";
import UsersService from "../../../services/UsersService";

const authStore = useAuthStore();
const ordersService = new OrdersService();
const $loading = useLoading();

const state = reactive({
  modalDetail: {} as Modal,
  modalfotoBefore: {} as Modal,
  modalAfter: {} as Modal,
  socketConnected: false,
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
const baseApiUrl = import.meta.env.VITE_API_BASE_URL;

const socket = io(baseApiUrl + "/notifications", {
  extraHeaders: {
    Authorization: `Bearer ${authStore.jwtToken}`,
  },
});

const orders = ref([] as Orders[]);
const fotoBefore = ref<File[]>([]);
const fotoAfter = ref<File[]>([]);
const videoAfter = ref<File>({} as File);

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
      autoClose: 5000,
    });
  }
}

function createObjectURL(file: File) {
  return window.URL.createObjectURL(file);
}

function removefotoBefore(index: number) {
  fotoBefore.value.splice(index, 1);
}

function removefotoAfter(index: number) {
  fotoAfter.value.splice(index, 1);
}
function removeVideoAfter() {
  videoAfter.value = {} as File;
}

const selectedOrder = ref<Orders | null>(null);

async function detailOrder(order: Orders) {
  selectedOrder.value = order;
  state.modalDetail.show();
}

async function fotoBeforeShow(order: Orders) {
  selectedOrder.value = order;
  state.modalfotoBefore.show();
}

async function fotoAfterShow(order: Orders) {
  selectedOrder.value = order;
  state.modalAfter.show();
}

async function before(orderId: number) {
  if (fotoBefore.value.length === 0) {
    toast.error("Upload foto before terlebih dahulu", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (fotoBefore.value.length > 5) {
    toast.error("Maksimal 5 foto", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (fotoBefore.value.some((file) => file.size > 5 * 1024 * 1024)) {
    toast.error("Ukuran file foto before maksimal 5MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  const $loader = $loading.show({
    canCancel: false,
  });

  try {
    const formData = new FormData();
    fotoBefore.value.forEach((file) => {
      formData.append("fotoBefore[]", file);
    });

    await ordersService.teknisiStart(orderId, formData, {
      headers: {
        Authorization: `Bearer ${authStore.jwtToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Berhasil upload foto before", {
      autoClose: 5000,
    });
    getOrders();
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        await authStore.refresh().catch(() => {
          return;
        });

        return before(orderId);
      }
    }

    toast.error("Gagal upload foto before", {
      autoClose: 5000,
    });
  }

  $loader.hide();
  state.modalfotoBefore.hide();
  fotoBefore.value = [];
  selectedOrder.value = null;
}

async function after(orderId: number) {
  if (
    fotoAfter.value.length === 0 &&
    Object.keys(videoAfter.value).length === 0
  ) {
    toast.error("Upload foto after atau video after terlebih dahulu", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (fotoAfter.value.length > 5) {
    toast.error("Maksimal 5 foto after", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (fotoAfter.value.some((file) => file.size > 5 * 1024 * 1024)) {
    toast.error("Ukuran file foto after maksimal 5MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (
    Object.keys(videoAfter.value).length > 0 &&
    videoAfter.value.size > 50 * 1024 * 1024
  ) {
    toast.error("Ukuran file video after maksimal 50MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  const $loader = $loading.show({
    canCancel: false,
  });
  try {
    const formData = new FormData();
    fotoAfter.value.forEach((file) => {
      formData.append("fotoAfter[]", file);
    });
    formData.append("videoAfter", videoAfter.value);

    await ordersService.teknisiFinish(orderId, formData, {
      headers: {
        Authorization: `Bearer ${authStore.jwtToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Berhasil upload foto after", {
      autoClose: 5000,
    });
    getOrders();
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        await authStore.refresh().catch(() => {
          return;
        });

        return after(orderId);
      }
    }

    toast.error("Gagal upload foto after", {
      autoClose: 5000,
    });
  }
}

async function finished(orderId: number) {
  if (
    fotoAfter.value.length === 0 &&
    Object.keys(videoAfter.value).length === 0
  ) {
    toast.error("Upload foto after atau video after terlebih dahulu", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }
  if (fotoAfter.value.length > 5) {
    toast.error("Maksimal 5 foto after", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }
  if (fotoAfter.value.some((file) => file.size > 5 * 1024 * 1024)) {
    toast.error("Ukuran file foto after maksimal 5MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  if (
    Object.keys(videoAfter.value).length > 0 &&
    videoAfter.value.size > 50 * 1024 * 1024
  ) {
    toast.error("Ukuran file video after maksimal 50MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  const $loader = $loading.show({
    canCancel: false,
  });

  try {
    const formData = new FormData();
    fotoAfter.value.forEach((file) => {
      formData.append("fotoAfter[]", file);
    });
    formData.append("videoAfter", videoAfter.value);

    await ordersService.teknisiFinish(orderId, formData, {
      headers: {
        Authorization: `Bearer ${authStore.jwtToken}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Berhasil upload foto after", {
      autoClose: 5000,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        await authStore.refresh().catch(() => {
          return;
        });

        return after(orderId);
      }
    }

    toast.error("Gagal upload foto after", {
      autoClose: 5000,
    });
  }

  $loader.hide();
}

function handleFotoBefore(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  if (!event.target.files) {
    return;
  }

  // limit to 5 files
  if (fotoBefore.value.length + event.target.files.length > 5) {
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
    fotoBefore.value.push(event.target.files[i]);
  }
}

function handleFotoAfter(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  if (!event.target.files) {
    return;
  }

  // limit to 5 files
  if (fotoAfter.value.length + event.target.files.length > 5) {
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
    fotoAfter.value.push(event.target.files[i]);
  }
}

function handleVideoAfter(event: Event) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  if (!event.target.files) {
    return;
  }

  // limit to 1 file
  if (Object.keys(videoAfter.value).length > 0) {
    toast.error("Maksimal 1 file", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }

  // limit files size to 50MB
  if (event.target.files[0].size > 50 * 1024 * 1024) {
    toast.error("Ukuran file maksimal 50MB", {
      autoClose: 3000,
      position: "top-right",
    });
    return;
  }
  videoAfter.value = event.target.files[0];
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

const pesananBaruNotif: UseWebNotificationOptions = {
  title: "Pesanan Baru",
  dir: "auto",
  lang: "id-ID",
  renotify: true,
  tag: "pesanan-baru",
  body: "Pesanan baru telah ditambahkan, dibutuhkan aksi segera",
  requestPermissions: true,
};

function showPerbaikanTimeoutNotif(no_order: string) {
  toast.error(`Batas waktu perbaikan ${no_order}  telah habis`, {
    autoClose: 5000,
  });

  const options: UseWebNotificationOptions = {
    title: "Batas Waktu Perbaikan Habis",
    dir: "auto",
    lang: "id-ID",
    renotify: true,
    tag: "perbaikan-timeout",
    body: `Batas waktu perbaikan ${no_order} telah habis`,
    requestPermissions: true,
  };

  useWebNotification(options).show();
}

onMounted(() => {
  try {
    state.modalDetail = Modal.getOrCreateInstance("#modalDetail");
    state.modalfotoBefore = Modal.getOrCreateInstance("#modalfotoBefore");
    state.modalAfter = Modal.getOrCreateInstance("#modalAfter");
  } catch (e) {
    console.log(e);
  }
  getOrders();

  setInterval(() => {
    getOrders();
  }, 180000);

  socket.on("connect", () => {
    state.socketConnected = true;
  });

  socket.on("disconnect", () => {
    state.socketConnected = false;
  });

  socket.on("order.created", () => {
    toast.success("Pesanan baru telah ditambahkan", {
      autoClose: 5000,
    });
    useWebNotification(pesananBaruNotif).show();
    getOrders();
  });

  socket.on("perbaikan_timeout", (data) => {
    showPerbaikanTimeoutNotif(data.no_order);
    getOrders();
  });
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
                  :class="{
                    'bg-success':
                      !order.kepala_teknisi &&
                      calculateTimeDifference(order.createdAt.toString()) === 0,
                    'bg-warning':
                      !order.kepala_teknisi &&
                      calculateTimeDifference(order.createdAt.toString()) === 1,
                    'bg-danger':
                      !order.kepala_teknisi &&
                      calculateTimeDifference(order.createdAt.toString()) === 2,
                    'border-top': true,
                  }"
                >
                  <td
                    :class="order.status === 'draft' ? 'text-white' : ''"
                    class="fw-bold"
                  >
                    {{ index + 1 }}
                  </td>
                  <td
                    :class="order.status === 'draft' ? 'text-white' : ''"
                    class="fw-bold"
                  >
                    {{ order.no_order }}
                  </td>
                  <td
                    :class="order.status === 'draft' ? 'text-white' : ''"
                    class="fw-bold"
                  >
                    {{ order.nama_pelanggan }}
                  </td>
                  <td
                    :class="order.status === 'draft' ? 'text-white' : ''"
                    class="fw-bold"
                  >
                    {{ order.status }}
                  </td>
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
                      v-if="!order.kepala_teknisi"
                      class="btn btn-success"
                      @click="before(order.id)"
                    >
                      <i class="bi bi-person-plus"></i>
                    </button>
                    <button
                      v-if="order.status === 'waiting_teknisi'"
                      class="btn btn-warning"
                      @click="fotoBeforeShow(order)"
                    >
                      <i class="bi bi-camera"></i>
                    </button>
                    <button
                      v-if="order.status === 'in_progress'"
                      class="btn btn-danger"
                      @click="fotoAfterShow(order)"
                    >
                      <i class="bi bi-camera"></i>
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

  <div class="modal fade" id="modalfotoBefore" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Foto sebelum Pengerjaan</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedOrder">
            <div class="mb-3">
              <input
                type="file"
                class="form-control"
                multiple
                accept="image/*"
                @change="handleFotoBefore"
              />
            </div>
            <div class="mt-3 mb-3" v-if="fotoBefore.length > 0">
              <div
                v-for="(file, index) in fotoBefore"
                :key="index"
                class="position-relative d-inline-block me-2 ms-2"
              >
                <img
                  :src="createObjectURL(file)"
                  class="object-fit-cover"
                  style="width: 100px; height: 100px"
                />
                <button
                  @click="removefotoBefore(index)"
                  class="position-absolute top-0 end-0 bg-transparent hover-bg-transparent text-white fw-bold p-1 rounded"
                >
                  <i class="bi bi-x"></i>
                </button>
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
          <button
            type="button"
            class="btn btn-primary"
            @click="before(selectedOrder!.id)"
            :disabled="fotoBefore.length === 0"
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modalAfter" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Upload Media Sesudah Pengerjaan</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="selectedOrder">
            <div class="mb-3">
              <label>Upload Foto Sesudah Pengerjaan:</label>
              <input
                type="file"
                class="form-control"
                accept="image/*"
                @change="handleFotoAfter"
              />
            </div>
            <div class="mt-3 mb-3" v-if="fotoAfter.length > 0">
              <div
                v-for="(file, index) in fotoAfter"
                :key="index"
                class="position-relative d-inline-block me-2 ms-2"
              >
                <img
                  :src="createObjectURL(file)"
                  class="object-fit-cover"
                  style="width: 100px; height: 100px"
                />
                <button
                  @click="removefotoAfter(index)"
                  class="position-absolute top-0 end-0 bg-transparent hover-bg-transparent text-white fw-bold p-1 rounded"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
            <div class="mb-3">
              <label>Upload Video Sesudah Pengerjaan:</label>
              <input
                type="file"
                class="form-control"
                accept="video/*"
                @change="handleVideoAfter"
              />
            </div>
            <div class="mb-3">
              <div v-if="Object.keys(videoAfter).length > 0">
                <video
                  :src="createObjectURL(videoAfter)"
                  class="object-fit-cover"
                  style="width: 100px; height: 100px"
                  controls
                ></video>
                <button
                  @click="removeVideoAfter"
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
              Tutup
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="finished(selectedOrder!.id)"
              :disabled="fotoAfter.length === 0 && !videoAfter"
            >
              Upload
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
