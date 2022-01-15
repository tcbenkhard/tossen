export const generateToken = () => {
    const validChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for(let i = 0; i < 6; i++) {
        token += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }
    return token;
}