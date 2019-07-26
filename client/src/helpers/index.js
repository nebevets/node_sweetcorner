export function withHeaders(){
    return {
        headers: {
            authorization: localStorage.getItem('sc-auth-token') || '',
            'x-cart-token': localStorage.getItem('sc-cart-token') || ''
        }
    }
}
