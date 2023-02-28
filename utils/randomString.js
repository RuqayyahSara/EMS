function randStr(length)
{
    let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
    let token = "";
    for (let i = 0; i < length; i++)
    {
        token += chars[Math.floor(Math.random() * (chars.length - 1))];
    }
    return token;
}
export default randStr;