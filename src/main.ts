import { invoke } from '@tauri-apps/api/core'
import db from '@/db'

let greetInputEl: HTMLInputElement | null
let greetMsgEl: HTMLElement | null

async function greet() {
  if (greetMsgEl && greetInputEl) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsgEl.textContent = await invoke('greet', {
      name: greetInputEl.value
    })
  }
}

window.addEventListener('DOMContentLoaded', () => {
  greetInputEl = document.querySelector('#greet-input')
  greetMsgEl = document.querySelector('#greet-msg')
  document.querySelector('#greet-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    console.log(db.accountBook.transactions.get())
    greet()
  })
})
