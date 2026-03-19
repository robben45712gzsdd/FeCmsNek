<template>
  <div class="filter-form">
    <div class="form-row">
      <slot name="fields"></slot>
    </div>

    <div class="button-actions">
      <button @click="$emit('search')" class="btn-primary">
        {{ $t("search") }}
      </button>
      <button @click="$emit('reset')" class="btn-ghost">
        {{ $t("reset") }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogsFilter",
};
</script>

<style scoped>
.filter-form {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #eef2f6;
}

.button-actions {
  display: flex;
  padding: 20px 20px 20px 0px;
  gap: 20px;
}
.btn-primary,
.btn-ghost {
  height: 36px;
  width: 100px;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: 600;
  font-size: 0.95rem;
}
.btn-primary {
  background: #0063ec;
  color: #fff;
}
.btn-ghost {
  background: #fff;
  color: #1f2937;
  border: 1px solid #dbe6f8;
}
</style>
