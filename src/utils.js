
const getUnit8Array = (base) => {
    return Uint8Array.from(atob(base), c => c.charCodeAt(0))
}

export { getUnit8Array }