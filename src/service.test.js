import {
    describe,
    expect,
    it
} from '@jest/globals'

import { sendEmail } from './service'

describe('Service tests', () => {
    it('sends e-mail', () => {
        sendEmail({
            from: "from@google.com",
            to: "to@google.com",
            html: "<b>Test</b>"
        })
    });
});