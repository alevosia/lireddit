import nodemailer from 'nodemailer'

interface Params {
    from: string
    to: string
    subject: string
    text?: string
    html?: string
}

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'qmiobbbsxlmpbcwn@ethereal.email', // generated ethereal user
        pass: 'bfCuXNnP2uTdeT7k7F', // generated ethereal password
    },
})

export async function sendEmail({ from, to, subject, text, html }: Params) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
    })

    console.log('Message sent: %s', info.messageId)
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
}
