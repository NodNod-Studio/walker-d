<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(defineProps<{
  label: string
  type?: string
  placeholder?: string
  error?: string
}>(), {
  type: 'text',
  placeholder: undefined,
  error: undefined,
})

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <label class="flex flex-col gap-1.5" :for="id">
    <span class="text-3 text-ink/55 uppercase">{{ label }}</span>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      class="text-3.8 font-sans px-2.8 py-2.2 border rounded-1.5 focus:outline-2 focus:outline-ink focus:outline-offset-1"
      :class="error ? 'border-red-700' : 'border-neutral-300'"
      v-bind="$attrs"
    >
    <span v-if="error" class="text-3 text-red-700">{{ error }}</span>
  </label>
</template>
