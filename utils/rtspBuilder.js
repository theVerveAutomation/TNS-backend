const buildRtspUrl = ({ username, password, ip }) => {
    const template = process.env.RTSP_TEMPLATE;

    if (!template) {
        throw new Error("RTSP_TEMPLATE is not defined in .env");
    }

    return template
        .replace("{username}", username)
        .replace("{password}", password)
        .replace("{ip}", ip);
};

module.exports = { buildRtspUrl };