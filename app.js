// ==========================================
// 1. اتصال به Supabase
// ==========================================

const SUPABASE_URL =
    "https://tujcsmurmojnnkhavglf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IkpCvlrLg7a1oQQrqXzBHg_tRJ6HJFY";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// ==========================================
// 2. متغیرهای عمومی
// ==========================================

let allCustomers = [];


// ==========================================
// 3. تست اتصال به Supabase
// ==========================================

async function testConnection() {

    const status =
        document.getElementById("connection-status");

    try {

        const { data, error } =
            await supabaseClient
                .from("customers")
                .select("id")
                .limit(1);

        if (error) {
            throw error;
        }

        if (status) {

            status.textContent =
                "✅ اتصال به دیتابیس با موفقیت انجام شد";

        }

        console.log(
            "Supabase connected:",
            data
        );

    } catch (error) {

        if (status) {

            status.textContent =
                "❌ اتصال به دیتابیس انجام نشد";

        }

        console.error(
            "Supabase Error:",
            error
        );
    }
}

'use strict';

/* =========================================================
   چاپ‌یار — سیستم مدیریت سفارشات چاپخانه
   نسخه: Supabase Edition
   =========================================================
   
   منبع اصلی اطلاعات:
   Supabase

   localStorage:
   فقط تنظیمات رابط کاربری / Theme

   sessionStorage:
   وضعیت موقت نشست کاربر

   جداول مورد استفاده:
   customers
   orders
   payments

   ========================================================= */


/* =========================================================
   1. SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://tujcsmurmojnnkhavglf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IkpCvlrLg7a1oQQrqXzBHg_tRJ6HJFY";

if (!window.supabase) {
    console.error("Supabase library is not loaded.");
    alert("کتابخانه Supabase در HTML بارگذاری نشده است.");
}

const supabaseClient = window.supabase
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    )
    : null;


/* =========================================================
   2. ابزارهای عمومی
   ========================================================= */

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];

const esc = value =>
    String(value ?? '').replace(
        /[&<>"']/g,
        char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char])
    );


/* =========================================================
   3. اعداد فارسی
   ========================================================= */

const NF = new Intl.NumberFormat('fa-IR');

const fa = number =>
    NF.format(Math.round(Number(number) || 0));


/* =========================================================
   4. ارز
   ========================================================= */

const CURRENCY = {
    AFN: {
        code: 'AFN',
        title: 'افغانی',
        symbol: '؋'
    },

    USD: {
        code: 'USD',
        title: 'دالر',
        symbol: '$'
    }
};

function currencyTitle(currency) {
    return CURRENCY[currency]?.title || currency || 'افغانی';
}

function currencySymbol(currency) {
    return CURRENCY[currency]?.symbol || '؋';
}

function money(amount, currency = 'AFN') {
    return `${fa(amount)} ${currencySymbol(currency)}`;
}


/* =========================================================
   5. تاریخ
   ========================================================= */

const DF = new Intl.DateTimeFormat(
    'fa-IR-u-ca-persian',
    {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }
);

const DF_LONG = new Intl.DateTimeFormat(
    'fa-IR-u-ca-persian',
    {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
);

const DF_TIME = new Intl.DateTimeFormat(
    'fa-IR-u-ca-persian',
    {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }
);

function validDate(value) {

    if (!value) return null;

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
        return null;
    }

    return d;
}

function dFa(value) {

    const d = validDate(value);

    if (!d) return '—';

    return DF.format(d);
}

function dFaLong(value) {

    const d = validDate(value);

    if (!d) return '—';

    return DF_LONG.format(d);
}

function dFaTime(value) {

    const d = validDate(value);

    if (!d) return '—';

    return DF_TIME.format(d);
}


/* =========================================================
   6. تبدیل تاریخ برای input[type=date]
   ========================================================= */

function isoDateOnly(value) {

    const d = validDate(value);

    if (!d) return '';

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;
}


/* =========================================================
   7. ID موقت سمت Frontend
   ========================================================= */

function localUid() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 9)
    );
}


/* =========================================================
   8. تنظیمات سیستم
   ========================================================= */

const APP = {

    shopName: 'چاپخانه هنر',

    defaultCurrency: 'AFN',

    defaultRate: 1,

    statuses: [
        'در حال انجام',
        'ثبت‌شده',
        'تصفیه‌شده'
    ],

    colors: [
        'تک‌رنگ',
        'دورنگ',
        'چهاررنگ',
        'تمام‌رنگی'
    ]
};


/* =========================================================
   9. وضعیت برنامه
   ========================================================= */

let DB = {

    customers: [],
    orders: [],
    payments: [],
    users: [],

    settings: {
        shop: APP.shopName
    }
};

let currentUser = null;

let currentPage = 'dashboard';

let pendingFlash = null;

let confirmRes = null;

let connectionOK = false;

let F = {
    q: '',
    status: '',
    range: ''
};


/* =========================================================
   10. دسترسی کاربران
   ========================================================= */

const PERMS = {

    dashboard: [
        'admin',
        'accountant',
        'staff'
    ],

    neworder: [
        'admin',
        'staff'
    ],

    orders: [
        'admin',
        'accountant',
        'staff'
    ],

    customers: [
        'admin',
        'accountant',
        'staff'
    ],

    finance: [
        'admin',
        'accountant'
    ],

    users: [
        'admin'
    ],

    settings: [
        'admin',
        'accountant'
    ]

};

const TITLES = {

    dashboard: 'پیشخوان',

    neworder: 'ثبت سفارش جدید',

    orders: 'مدیریت سفارشات',

    customers: 'مشتریان',

    finance: 'گزارش‌های مالی',

    users: 'مدیریت کاربران',

    settings: 'تنظیمات و پشتیبان'

};

const ROLES = {

    admin: 'مدیر',

    accountant: 'حسابدار',

    staff: 'کارمند'

};

const ST_CLS = {

    'در حال انجام': 'a',

    'ثبت‌شده': 'b',

    'تصفیه‌شده': 'c'

};

const ST_COL = {

    'در حال انجام': '#e8a013',

    'ثبت‌شده': '#00a6c8',

    'تصفیه‌شده': '#2f9e63'

};

const canEdit = () =>
    currentUser &&
    ['admin', 'staff'].includes(currentUser.role);

const canDelete = () =>
    currentUser &&
    currentUser.role === 'admin';


/* =========================================================
   11. تست اتصال
   ========================================================= */

async function testConnection() {

    const status =
        document.getElementById('connection-status');

    if (!supabaseClient) {

        connectionOK = false;

        if (status) {
            status.textContent =
                '❌ کتابخانه Supabase بارگذاری نشده است';
        }

        return false;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from('customers')
            .select('id')
            .limit(1);

        if (error) {
            throw error;
        }

        connectionOK = true;

        if (status) {

            status.textContent =
                '✅ اتصال به دیتابیس با موفقیت انجام شد';

        }

        console.log(
            'Supabase connection successful.'
        );

        return true;

    } catch (error) {

        connectionOK = false;

        if (status) {

            status.textContent =
                '❌ اتصال به دیتابیس انجام نشد';

        }

        console.error(
            'Supabase connection error:',
            error
        );

        return false;
    }
}


/* =========================================================
   12. مدیریت خطای Supabase
   ========================================================= */

function showSupabaseError(
    error,
    fallback = 'خطایی در ارتباط با دیتابیس رخ داد'
) {

    console.error(error);

    let message = fallback;

    if (error?.message) {
        message += `\n${error.message}`;
    }

    toast(message, 'err');
}


/* =========================================================
   13. دریافت تمام اطلاعات
   ========================================================= */

async function loadDB() {

    if (!supabaseClient) {
        throw new Error(
            'Supabase client is not available.'
        );
    }


    const [
        customersRes,
        ordersRes,
        paymentsRes
    ] = await Promise.all([

        supabaseClient
            .from('customers')
            .select('*')
            .order('created_at', {
                ascending: false
            }),

        supabaseClient
            .from('orders')
            .select('*')
            .order('order_date', {
                ascending: false
            }),

        supabaseClient
            .from('payments')
            .select('*')
            .order('payment_date', {
                ascending: false
            })

    ]);


    if (customersRes.error) {
        throw customersRes.error;
    }

    if (ordersRes.error) {
        throw ordersRes.error;
    }

    if (paymentsRes.error) {
        throw paymentsRes.error;
    }


    DB.customers =
        customersRes.data || [];

    DB.orders =
        ordersRes.data || [];

    DB.payments =
        paymentsRes.data || [];


    DB.settings = {

        shop:
            localStorage.getItem(
                'chapyar_shop_name'
            ) || APP.shopName

    };


    return DB;
}


/* =========================================================
   14. تبدیل سفارش دیتابیس به مدل UI
   ========================================================= */

function normalizeOrder(row) {

    if (!row) return null;

    return {

        id: row.id,

        no: row.order_no,

        customer_id:
            row.customer_id,

        job:
            row.job_name || '',

        customer:
            row.customer_name || '',

        phone:
            row.customer_phone || '',

        address:
            row.customer_address || '',

        desc:
            row.description || '',

        date:
            row.order_date,

        delivery:
            row.delivery_date,

        qty:
            Number(row.qty || 0),

        color:
            row.color || '',

        size:
            row.size || '',

        material:
            row.material || '',

        packaged:
            Boolean(row.is_packaged),

        price:
            Number(row.price || 0),

        currency:
            row.currency || 'AFN',

        rate:
            Number(row.rate || 1),

        paid:
            Number(row.received || 0),

        status:
            row.status || 'در حال انجام',

        is_ledgered:
            Boolean(row.is_ledgered),

        created_at:
            row.created_at,

        updated_at:
            row.updated_at

    };

}


/* =========================================================
   15. لیست سفارشات برای UI
   ========================================================= */

function uiOrders() {

    return DB.orders.map(normalizeOrder);

}


/* =========================================================
   16. پیدا کردن مشتری
   ========================================================= */

function findCustomer(id) {

    return DB.customers.find(
        c => String(c.id) === String(id)
    ) || null;

}


/* =========================================================
   17. نام مشتری سفارش
   ========================================================= */

function customerForOrder(order) {

    const c =
        findCustomer(order.customer_id);

    return {

        name:
            c?.name || '',

        phone:
            c?.phone || '',

        address:
            c?.address || ''

    };

}


/* =========================================================
   18. مانده سفارش
   ========================================================= */

function remain(order) {

    return Math.max(
        Number(order.price || 0) -
        Number(order.paid || 0),
        0
    );

}


/* =========================================================
   19. شروع روز
   ========================================================= */

function dayStart(date) {

    const d =
        new Date(date);

    d.setHours(
        0,
        0,
        0,
        0
    );

    return d.getTime();

}


/* =========================================================
   20. ثبت Log
   =========================================================
   توجه:
   جدول logs در ساختار فعلی قطعی نیست.
   بنابراین فعلاً log فقط Console است.
   بعداً می‌توان جدول logs اضافه کرد.
   ========================================================= */

function log(user, text) {

    console.log(
        `[PRINTYAR] ${user}: ${text}`
    );

}


/* =========================================================
   21. شماره بعدی سفارش
   ========================================================= */

async function getNextOrderNo() {

    const {
        data,
        error
    } = await supabaseClient
        .from('orders')
        .select('order_no')
        .order('order_no', {
            ascending: false
        })
        .limit(1);

    if (error) {
        throw error;
    }

    const last =
        Number(data?.[0]?.order_no || 1000);

    return last + 1;

}


/* =========================================================
   22. شماره بعدی مشتری
   ========================================================= */

async function getNextCustomerNo() {

    const {
        data,
        error
    } = await supabaseClient
        .from('customers')
        .select('customer_no')
        .order('customer_no', {
            ascending: false
        })
        .limit(1);

    if (error) {
        throw error;
    }

    const last =
        Number(data?.[0]?.customer_no || 0);

    return last + 1;

}


/* =========================================================
   23. شماره بعدی پرداخت
   ========================================================= */

async function getNextPaymentNo() {

    const {
        data,
        error
    } = await supabaseClient
        .from('payments')
        .select('payment_no')
        .order('payment_no', {
            ascending: false
        })
        .limit(1);

    if (error) {
        throw error;
    }

    const last =
        Number(data?.[0]?.payment_no || 0);

    return last + 1;

}


/* =========================================================
   24. پیدا کردن / ایجاد مشتری
   ========================================================= */

async function findOrCreateCustomer({
    name,
    phone,
    address = '',
    type = 'نقدی'
}) {

    name =
        String(name || '').trim();

    phone =
        String(phone || '').trim();

    if (!name || !phone) {

        throw new Error(
            'نام و شماره مشتری الزامی است.'
        );

    }


    const {
        data: existing,
        error: findError
    } = await supabaseClient
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .limit(1);

    if (findError) {
        throw findError;
    }


    if (existing?.length) {

        const customer =
            existing[0];

        const updates = {};

        if (
            name &&
            customer.name !== name
        ) {
            updates.name = name;
        }

        if (
            address &&
            customer.address !== address
        ) {
            updates.address = address;
        }

        if (
            type &&
            customer.type !== type
        ) {
            updates.type = type;
        }


        if (Object.keys(updates).length) {

            const {
                data,
                error
            } = await supabaseClient
                .from('customers')
                .update(updates)
                .eq('id', customer.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return data;
        }

        return customer;
    }


    const customerNo =
        await getNextCustomerNo();


    const payload = {

        customer_no:
            customerNo,

        name,

        phone,

        address,

        type

    };


    const {
        data,
        error
    } = await supabaseClient
        .from('customers')
        .insert(payload)
        .select()
        .single();


    if (error) {
        throw error;
    }


    return data;

}


/* =========================================================
   25. اطلاعات مشتریان
   ========================================================= */

function customersAgg() {

    const map =
        new Map();


    DB.customers.forEach(
        customer => {

            map.set(
                String(customer.id),
                {

                    id:
                        customer.id,

                    name:
                        customer.name || '',

                    phone:
                        customer.phone || '',

                    address:
                        customer.address || '',

                    type:
                        customer.type || 'نقدی',

                    orders: 0,

                    totalAFN: 0,

                    paidAFN: 0,

                    balanceAFN: 0,

                    last: null

                }
            );

        }
    );


    uiOrders().forEach(order => {

        const customer =
            map.get(
                String(order.customer_id)
            );

        if (!customer) return;


        customer.orders++;


        const amountAFN =
            order.currency === 'USD'
                ? order.price * order.rate
                : order.price;


        const receivedAFN =
            order.currency === 'USD'
                ? order.paid * order.rate
                : order.paid;


        customer.totalAFN +=
            amountAFN;


        customer.paidAFN +=
            receivedAFN;


        customer.balanceAFN =
            customer.totalAFN -
            customer.paidAFN;


        if (
            !customer.last ||
            new Date(order.date) >
            new Date(customer.last.date)
        ) {

            customer.last = order;

        }

    });


    return [...map.values()]
        .sort(
            (a, b) =>
                b.balanceAFN -
                a.balanceAFN
        );

}


/* =========================================================
   26. درآمد
   ========================================================= */

function incomeSince(ts) {

    return uiOrders()
        .filter(
            order =>
                new Date(order.date).getTime() >= ts
        )
        .reduce(
            (sum, order) => {

                const received =
                    order.currency === 'USD'
                        ? order.paid * order.rate
                        : order.paid;

                return sum + received;

            },
            0
        );

}


/* =========================================================
   27. فروش کل
   ========================================================= */

function salesTotal() {

    return uiOrders()
        .reduce(
            (sum, order) => {

                const value =
                    order.currency === 'USD'
                        ? order.price * order.rate
                        : order.price;

                return sum + value;

            },
            0
        );

}


/* =========================================================
   28. بدهی کل
   ========================================================= */

function debtTotal() {

    return uiOrders()
        .reduce(
            (sum, order) => {

                const value =
                    remainInAFN(order);

                return sum + value;

            },
            0
        );

}


/* =========================================================
   29. مانده به افغانی
   ========================================================= */

function remainInAFN(order) {

    const remaining =
        remain(order);

    if (
        order.currency === 'USD'
    ) {

        return remaining *
            Number(order.rate || 1);

    }

    return remaining;

}


/* =========================================================
   30. تعداد وضعیت
   ========================================================= */

function stCount(status) {

    return uiOrders()
        .filter(
            order =>
                order.status === status
        )
        .length;

}


/* =========================================================
   31. داشبورد
   ========================================================= */

function animateNumber(
    element,
    target,
    isMoney = false
) {

    if (!element) return;


    const start =
        performance.now();

    const duration =
        700;


    function frame(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        const ease =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        element.textContent =
            isMoney
                ? money(target * ease)
                : fa(target * ease);


        if (progress < 1) {
            requestAnimationFrame(frame);
        }

    }


    requestAnimationFrame(frame);

}


function kpiCard(
    label,
    value,
    acc,
    sub = '',
    hero = false,
    isMoney = false
) {

    return `
        <div class="kpi ${acc} ${hero ? 'hero' : ''}">
            <div class="lbl">
                ${esc(label)}
            </div>

            <div
                class="num"
                data-v="${value}"
                data-m="${isMoney ? 1 : 0}"
            >
                ۰
            </div>

            ${
                sub
                    ? `<div class="sub2">
                        ${sub}
                       </div>`
                    : ''
            }
        </div>
    `;

}


/* =========================================================
   32. داشبورد
   ========================================================= */

function renderDashboard() {

    const orders =
        uiOrders();

    const now =
        Date.now();

    const today =
        dayStart(now);


    const incToday =
        incomeSince(today);

    const inc7 =
        incomeSince(
            now - 7 * 864e5
        );

    const inc30 =
        incomeSince(
            now - 30 * 864e5
        );


    const debt =
        debtTotal();


    const debtors =
        customersAgg()
            .filter(
                c =>
                    c.balanceAFN > 0
            )
            .length;


    const grid =
        $('#kpiGrid');

    if (!grid) return;


    grid.innerHTML =

        kpiCard(
            'دریافتی ۳۰ روز اخیر',
            inc30,
            'acc-c',
            `امروز ${money(incToday)}
             • ۷ روز اخیر ${money(inc7)}`,
            true,
            true
        )

        +

        kpiCard(
            'سفارشات امروز',
            orders.filter(
                o =>
                    new Date(o.date)
                        .getTime() >= today
            ).length,
            'acc-m',
            `مجموع کل:
             ${fa(orders.length)} سفارش`
        )

        +

        kpiCard(
            'در حال انجام',
            stCount('در حال انجام'),
            'acc-y'
        )

        +

        kpiCard(
            'ثبت‌شده',
            stCount('ثبت‌شده'),
            'acc-k'
        )

        +

        kpiCard(
            'تصفیه‌شده',
            stCount('تصفیه‌شده'),
            'acc-g'
        )

        +

        kpiCard(
            'بدهی مشتریان',
            debt,
            'acc-m',
            `${fa(debtors)}
             مشتری دارای مانده`,
            false,
            true
        );


    $$('#kpiGrid .num')
        .forEach(
            element =>
                animateNumber(
                    element,
                    Number(
                        element.dataset.v
                    ),
                    element.dataset.m === '1'
                )
        );


    const recent =
        [...orders]
            .sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            )
            .slice(0, 5);


    const recentList =
        $('#recentList');


    if (recentList) {

        recentList.innerHTML =
            recent.length

                ? recent.map(
                    order => `
                        <div class="mrow">

                            <div class="grow">

                                <b>
                                    ${esc(order.job)}
                                </b>

                                <small>
                                    ${esc(order.customer)}
                                    •
                                    ${dFa(order.date)}
                                </small>

                            </div>

                            <span class="mbadge">
                                ${money(
                                    order.price,
                                    order.currency
                                )}
                            </span>

                            <span class="badge st-${ST_CLS[order.status]}">
                                ${esc(order.status)}
                            </span>

                        </div>
                    `
                ).join('')

                : `
                    <p class="hint"
                       style="padding:14px">
                        هنوز سفارشی ثبت نشده است.
                    </p>
                `;

    }


    const deliveryList =
        $('#deliveryList');


    if (deliveryList) {

        const upcoming =
            orders

                .filter(
                    o =>
                        o.delivery &&
                        o.status !==
                        'تصفیه‌شده'
                )

                .map(
                    o => ({
                        o,

                        days:
                            Math.ceil(
                                (
                                    dayStart(
                                        o.delivery
                                    ) -
                                    dayStart(
                                        new Date()
                                    )
                                ) /
                                864e5
                            )

                    })
                )

                .sort(
                    (a, b) =>
                        a.days - b.days
                )

                .slice(0, 5);


        deliveryList.innerHTML =
            upcoming.length

                ? upcoming.map(
                    ({ o, days }) => `
                        <div class="mrow">

                            <div class="grow">

                                <b>
                                    ${esc(o.job)}
                                </b>

                                <small>
                                    ${esc(o.customer)}
                                    • تحویل:
                                    ${dFa(o.delivery)}
                                </small>

                            </div>

                            <span class="mbadge ${
                                days < 0
                                    ? 'over'
                                    : days <= 2
                                        ? 'soon'
                                        : ''
                            }">

                                ${
                                    days < 0
                                        ? `${fa(-days)} روز تأخیر`
                                        : days === 0
                                            ? 'امروز'
                                            : `${fa(days)} روز مانده`
                                }

                            </span>

                        </div>
                    `
                ).join('')

                : `
                    <p class="hint"
                       style="padding:14px">
                        تحویل نزدیکی وجود ندارد.
                    </p>
                `;

    }

}


/* =========================================================
   33. فرم سفارش
   ========================================================= */

function orderFormHTML(order = {}) {

    const customer =
        order.customer_id
            ? findCustomer(
                order.customer_id
            )
            : null;


    const currency =
        order.currency || 'AFN';


    return `

        <div class="frm">

            <div class="field">

                <label>
                    شماره سفارش
                </label>

                <input
                    value="${
                        order.no
                            ? 'سفارش ' +
                              fa(order.no)
                            : 'خودکار'
                    }"
                    disabled
                >

            </div>


            <div class="field">

                <label>
                    تاریخ ثبت
                </label>

                <input
                    value="${
                        order.date
                            ? dFa(order.date)
                            : dFa(new Date())
                    }"
                    disabled
                >

            </div>


            <div class="field">

                <label>
                    نام کار *
                </label>

                <input
                    id="f_job"
                    value="${esc(order.job || '')}"
                    placeholder="مثلاً کارت ویزیت، بنر..."
                    required
                >

            </div>


            <div class="field">

                <label>
                    نام سفارش‌دهنده *
                </label>

                <input
                    id="f_customer"
                    value="${esc(
                        order.customer ||
                        customer?.name ||
                        ''
                    )}"
                    required
                >

            </div>


            <div class="field">

                <label>
                    شماره تماس *
                </label>

                <input
                    id="f_phone"
                    dir="ltr"
                    value="${esc(
                        order.phone ||
                        customer?.phone ||
                        ''
                    )}"
                    placeholder="07xxxxxxxx"
                    required
                >

            </div>


            <div class="field">

                <label>
                    تاریخ تحویل
                </label>

                <input
                    type="date"
                    id="f_delivery"
                    value="${
                        order.delivery
                            ? isoDateOnly(
                                order.delivery
                            )
                            : ''
                    }"
                >

            </div>


            <div class="field">

                <label>
                    تعداد
                </label>

                <input
                    type="number"
                    id="f_qty"
                    min="1"
                    value="${order.qty ?? 1}"
                >

            </div>


            <div class="field">

                <label>
                    رنگ چاپ
                </label>

                <select id="f_color">

                    ${APP.colors.map(
                        color =>
                            `
                            <option
                                ${
                                    color ===
                                    order.color
                                        ? 'selected'
                                        : ''
                                }
                            >
                                ${color}
                            </option>
                            `
                    ).join('')}

                </select>

            </div>


            <div class="field">

                <label>
                    سایز
                </label>

                <input
                    id="f_size"
                    value="${esc(order.size || '')}"
                    placeholder="A4، ۵۰×۷۰..."
                >

            </div>


            <div class="field">

                <label>
                    جنس
                </label>

                <input
                    id="f_material"
                    value="${esc(order.material || '')}"
                    placeholder="گلاسه، فلکس..."
                >

            </div>


            <div class="field">

                <label>
                    نوع مشتری
                </label>

                <select id="f_customer_type">

                    <option
                        value="نقدی"
                        ${
                            customer?.type !== 'نسیه'
                                ? 'selected'
                                : ''
                        }
                    >
                        مشتری نقدی
                    </option>

                    <option
                        value="نسیه"
                        ${
                            customer?.type === 'نسیه'
                                ? 'selected'
                                : ''
                        }
                    >
                        مشتری نسیه
                    </option>

                </select>

            </div>


            <div class="field">

                <label>
                    ارز
                </label>

                <select id="f_currency">

                    <option
                        value="AFN"
                        ${
                            currency === 'AFN'
                                ? 'selected'
                                : ''
                        }
                    >
                        افغانی
                    </option>

                    <option
                        value="USD"
                        ${
                            currency === 'USD'
                                ? 'selected'
                                : ''
                        }
                    >
                        دالر
                    </option>

                </select>

            </div>


            <div class="field">

                <label>
                    نرخ دالر
                </label>

                <input
                    type="number"
                    id="f_rate"
                    min="1"
                    value="${
                        order.rate ||
                        APP.defaultRate
                    }"
                >

            </div>


            <div class="field span2">

                <label>
                    آدرس
                </label>

                <input
                    id="f_address"
                    value="${esc(
                        order.address ||
                        customer?.address ||
                        ''
                    )}"
                >

            </div>


            <div class="field span2">

                <label>
                    توضیحات کامل سفارش
                </label>

                <textarea
                    id="f_desc"
                    rows="2"
                >${esc(
                    order.desc || ''
                )}</textarea>

            </div>


            <div class="field">

                <label>
                    قیمت کل
                </label>

                <input
                    type="number"
                    id="f_price"
                    min="0"
                    value="${order.price ?? ''}"
                    required
                >

            </div>


            <div class="field">

                <label>
                    مبلغ رسیده / دریافتی
                </label>

                <input
                    type="number"
                    id="f_paid"
                    min="0"
                    value="${order.paid ?? 0}"
                >

            </div>


            <div class="field">

                <label>
                    مبلغ الباقی
                </label>

                <input
                    id="f_remain"
                    disabled
                >

            </div>


            ${
                order.status

                    ? `
                        <div class="field">

                            <label>
                                وضعیت
                            </label>

                            <select id="f_status">

                                ${APP.statuses.map(
                                    status =>
                                        `
                                        <option
                                            ${
                                                status ===
                                                order.status
                                                    ? 'selected'
                                                    : ''
                                            }
                                        >
                                            ${status}
                                        </option>
                                        `
                                ).join('')}

                            </select>

                        </div>
                    `

                    : ''
            }

        </div>

    `;

}


/* =========================================================
   34. اتصال فرم
   ========================================================= */

function bindForm(form, order) {

    if (!form) return;


    const footer =
        form.querySelector(
            '.form-foot'
        )?.outerHTML || '';


    form.innerHTML =
        orderFormHTML(
            order || {}
        ) +
        footer;


    const price =
        form.querySelector(
            '#f_price'
        );

    const paid =
        form.querySelector(
            '#f_paid'
        );

    const remainField =
        form.querySelector(
            '#f_remain'
        );

    const currency =
        form.querySelector(
            '#f_currency'
        );

    const rate =
        form.querySelector(
            '#f_rate'
        );


    function updateRemain() {

        const p =
            Number(
                price?.value || 0
            );

        const pd =
            Number(
                paid?.value || 0
            );

        const c =
            currency?.value || 'AFN';

        remainField.value =
            money(
                Math.max(
                    p - pd,
                    0
                ),
                c
            );

    }


    price?.addEventListener(
        'input',
        updateRemain
    );

    paid?.addEventListener(
        'input',
        updateRemain
    );

    currency?.addEventListener(
        'change',
        updateRemain
    );

    rate?.addEventListener(
        'input',
        updateRemain
    );


    updateRemain();


    form.onsubmit =
        async event => {

            event.preventDefault();

            await saveOrder(
                form,
                order
            );

        };

}


/* =========================================================
   35. ذخیره سفارش در Supabase
   ========================================================= */

async function saveOrder(
    form,
    oldOrder
) {

    try {

        const get =
            selector =>
                form.querySelector(
                    selector
                )?.value?.trim() || '';


        const job =
            get('#f_job');

        const customerName =
            get('#f_customer');

        const phone =
            get('#f_phone');

        const address =
            get('#f_address');

        const description =
            get('#f_desc');

        const delivery =
            get('#f_delivery');

        const qty =
            Number(
                get('#f_qty')
            ) || 1;

        const color =
            get('#f_color');

        const size =
            get('#f_size');

        const material =
            get('#f_material');

        const customerType =
            get('#f_customer_type') ||
            'نقدی';

        const currency =
            get('#f_currency') ||
            'AFN';

        const rate =
            Number(
                get('#f_rate')
            ) || 1;

        const price =
            Number(
                get('#f_price')
            );


        const received =
            Number(
                get('#f_paid')
            ) || 0;


        if (!job) {

            toast(
                'نام کار الزامی است.',
                'err'
            );

            return;

        }


        if (!customerName) {

            toast(
                'نام مشتری الزامی است.',
                'err'
            );

            return;

        }


        if (!phone) {

            toast(
                'شماره تماس الزامی است.',
                'err'
            );

            return;

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            toast(
                'قیمت کل معتبر نیست.',
                'err'
            );

            return;

        }


        if (
            currency === 'USD' &&
            rate <= 0
        ) {

            toast(
                'نرخ دالر را وارد کنید.',
                'err'
            );

            return;

        }


        if (
            received > price
        ) {

            toast(
                'مبلغ دریافتی نمی‌تواند بیشتر از قیمت کل باشد.',
                'err'
            );

            return;

        }


        /* -----------------------------------------
           1. مشتری
           ----------------------------------------- */

        const customer =
            await findOrCreateCustomer({

                name:
                    customerName,

                phone:
                    phone,

                address:
                    address,

                type:
                    customerType

            });


        /* -----------------------------------------
           2. وضعیت سفارش
           ----------------------------------------- */

        let status =
            oldOrder?.status ||
            'در حال انجام';


        if (
            received >= price &&
            price > 0
        ) {

            status =
                'تصفیه‌شده';

        }


        /* -----------------------------------------
           3. شماره سفارش
           ----------------------------------------- */

        const orderNo =
            oldOrder?.no ||
            await getNextOrderNo();


        /* -----------------------------------------
           4. اطلاعات دیتابیس
           ----------------------------------------- */

        const payload = {

            order_no:
                orderNo,

            customer_id:
                customer.id,

            job_name:
                job,

            qty:
                qty,

            color:
                color,

            size:
                size,

            material:
                material,

            is_packaged:
                oldOrder?.packaged || false,

            price:
                price,

            currency:
                currency,

            rate:
                rate,

            received:
                received,

            description:
                description,

            order_date:
                oldOrder?.date ||
                new Date().toISOString(),

            delivery_date:
                delivery || null,

            status:
                status,

            is_ledgered:
                oldOrder?.is_ledgered || false,

            updated_at:
                new Date().toISOString()

        };


        /* -----------------------------------------
           5. UPDATE
           ----------------------------------------- */

        if (oldOrder?.id) {

            const {
                data,
                error
            } = await supabaseClient

                .from('orders')

                .update(payload)

                .eq(
                    'id',
                    oldOrder.id
                )

                .select()

                .single();


            if (error) {
                throw error;
            }


            log(
                currentUser.name,
                `سفارش ${fa(orderNo)} ویرایش شد`
            );


            toast(
                'تغییرات سفارش ذخیره شد ✔'
            );

        }


        /* -----------------------------------------
           6. INSERT
           ----------------------------------------- */

        else {

            payload.created_by =
                currentUser?.id ||
                null;


            const {
                data,
                error
            } = await supabaseClient

                .from('orders')

                .insert(payload)

                .select()

                .single();


            if (error) {
                throw error;
            }


            log(
                currentUser.name,
                `سفارش ${fa(orderNo)} ثبت شد`
            );


            pendingFlash =
                orderNo;


            toast(
                `سفارش شماره ${fa(orderNo)} با موفقیت ثبت شد 🖨`
            );

        }


        await loadDB();

        closeModals();

        navigate('orders');

    } catch (error) {

        showSupabaseError(
            error,
            'ثبت سفارش انجام نشد'
        );

    }

}


/* =========================================================
   36. فرم سفارش جدید
   ========================================================= */

function renderNewOrder() {

    const form =
        $('#formNew');

    if (!form) return;

    bindForm(
        form,
        null
    );

}


/* =========================================================
   37. فیلتر سفارشات
   ========================================================= */

function filteredOrders() {

    const q =
        F.q
            .trim()
            .toLowerCase();


    let list =
        uiOrders();


    list.sort(
        (a, b) =>
            new Date(b.date) -
            new Date(a.date)
    );


    if (q) {

        list =
            list.filter(
                order => {

                    const values = [

                        order.customer,

                        order.job,

                        order.phone,

                        String(order.no),

                        fa(order.no),

                        order.size,

                        order.material

                    ];


                    return values.some(
                        value =>
                            String(
                                value || ''
                            )
                            .toLowerCase()
                            .includes(q)
                    );

                }
            );

    }


    if (F.status) {

        list =
            list.filter(
                order =>
                    order.status ===
                    F.status
            );

    }


    if (F.range) {

        const now =
            Date.now();

        let from;


        if (
            F.range ===
            'today'
        ) {

            from =
                dayStart(
                    new Date()
                );

        }

        else {

            const days =
                Number(
                    F.range
                ) || 30;

            from =
                now -
                days *
                864e5;

        }


        list =
            list.filter(
                order =>
                    new Date(
                        order.date
                    ).getTime() >= from
            );

    }


    return list;

}


/* =========================================================
   38. جدول سفارشات
   ========================================================= */

function renderOrders() {

    const edit =
        canEdit();

    const del =
        canDelete();


    const chips = [

        [
            '',
            'همه',
            DB.orders.length
        ],

        [
            'در حال انجام',
            'در حال انجام',
            stCount(
                'در حال انجام'
            )
        ],

        [
            'ثبت‌شده',
            'ثبت‌شده',
            stCount(
                'ثبت‌شده'
            )
        ],

        [
            'تصفیه‌شده',
            'تصفیه‌شده',
            stCount(
                'تصفیه‌شده'
            )
        ]

    ];


    const chipBox =
        $('#statusChips');


    if (chipBox) {

        chipBox.innerHTML =
            chips.map(
                ([value, label, count]) =>
                    `
                    <button
                        class="chip ${
                            F.status === value
                                ? 'on'
                                : ''
                        }"
                        data-st="${value}"
                    >
                        ${label}
                        (${fa(count)})
                    </button>
                    `
            ).join('');

    }


    const list =
        filteredOrders();


    const count =
        $('#ordersCount');


    if (count) {

        count.textContent =
            `${fa(list.length)} سفارش`;

    }


    const body =
        $('#ordersBody');


    if (!body) return;


    body.innerHTML =
        list.length

            ? list.map(
                order => {

                    const balance =
                        remain(order);


                    return `

                        <tr
                            data-id="${order.id}"
                            class="${
                                order.no ===
                                pendingFlash
                                    ? 'flash'
                                    : ''
                            }"
                        >

                            <td class="num">
                                ${fa(order.no)}
                            </td>

                            <td>
                                ${dFa(order.date)}
                            </td>

                            <td>

                                <b>
                                    ${esc(order.job)}
                                </b>

                                ${
                                    order.desc
                                        ? `
                                            <span class="muted">
                                                ${esc(
                                                    order.desc
                                                        .slice(
                                                            0,
                                                            26
                                                        )
                                                )}
                                            </span>
                                          `
                                        : ''
                                }

                            </td>

                            <td>
                                ${esc(order.customer)}
                            </td>

                            <td
                                dir="ltr"
                                style="text-align:right"
                            >
                                ${esc(order.phone)}
                            </td>

                            <td>
                                ${fa(order.qty)}
                            </td>

                            <td>
                                ${esc(order.color)}
                            </td>

                            <td>
                                ${esc(
                                    order.size ||
                                    '—'
                                )}
                            </td>

                            <td>
                                ${esc(
                                    order.material ||
                                    '—'
                                )}
                            </td>

                            <td>

                                ${
                                    edit

                                        ? `
                                            <label
                                                class="chk"
                                                title="وضعیت بسته‌بندی"
                                            >

                                                <input
                                                    type="checkbox"
                                                    data-pack="${order.id}"
                                                    ${
                                                        order.packaged
                                                            ? 'checked'
                                                            : ''
                                                    }
                                                >

                                                <span></span>

                                            </label>
                                          `

                                        : (
                                            order.packaged
                                                ? '✔'
                                                : '—'
                                        )
                                }

                            </td>

                            <td>
                                ${money(
                                    order.price,
                                    order.currency
                                )}
                            </td>

                            <td>
                                ${money(
                                    order.paid,
                                    order.currency
                                )}
                            </td>

                            <td
                                class="${
                                    balance > 0
                                        ? 'rem-pos'
                                        : 'rem-zero'
                                }"
                            >
                                ${money(
                                    balance,
                                    order.currency
                                )}
                            </td>

                            <td>

                                <span
                                    class="badge st-${
                                        ST_CLS[
                                            order.status
                                        ]
                                    }"
                                >
                                    ${esc(
                                        order.status
                                    )}
                                </span>

                            </td>

                            <td>

                                <div class="ops">

                                    <button
                                        class="ibtn"
                                        data-act="invoice"
                                        title="چاپ فاکتور"
                                    >
                                        🖨
                                    </button>


                                    ${
                                        edit

                                            ? `
                                                <button
                                                    class="ibtn"
                                                    data-act="edit"
                                                    title="ویرایش"
                                                >
                                                    ✏️
                                                </button>
                                              `
                                            : ''
                                    }


                                    ${
                                        edit &&
                                        order.status !==
                                            'ثبت‌شده'

                                            ? `
                                                <button
                                                    class="ibtn"
                                                    data-act="reg"
                                                    title="انتقال به ثبت‌شده"
                                                >
                                                    🗂️
                                                </button>
                                              `
                                            : ''
                                    }


                                    ${
                                        edit &&
                                        order.status !==
                                            'تصفیه‌شده'

                                            ? `
                                                <button
                                                    class="ibtn ok"
                                                    data-act="settle"
                                                    title="تصفیه سفارش"
                                                >
                                                    ✅
                                                </button>
                                              `
                                            : ''
                                    }


                                    ${
                                        del

                                            ? `
                                                <button
                                                    class="ibtn danger"
                                                    data-act="del"
                                                    title="حذف"
                                                >
                                                    🗑️
                                                </button>
                                              `
                                            : ''
                                    }

                                </div>

                            </td>

                        </tr>

                    `;

                }
            ).join('')

            : `
                <tr class="empty">

                    <td colspan="15">
                        🔍 سفارشی مطابق جستجو پیدا نشد
                    </td>

                </tr>
              `;


    pendingFlash =
        null;


    const newButton =
        $('#btnGoNew');


    if (newButton) {

        newButton.style.display =
            PERMS.neworder.includes(
                currentUser.role
            )
                ? ''
                : 'none';

    }

}


/* =========================================================
   39. ویرایش سفارش
   ========================================================= */

function openEdit(order) {

    const modalTitle =
        $('#moTitle');

    if (modalTitle) {

        modalTitle.textContent =
            `ویرایش سفارش
             ${fa(order.no)}
             — ${order.job}`;

    }


    const form =
        $('#formEdit');


    if (!form) return;


    bindForm(
        form,
        order
    );


    openModal(
        'modalOrder'
    );

}


/* =========================================================
   40. انتقال سفارش به ثبت‌شده
   ========================================================= */

async function registerOrder(order) {

    try {

        const {
            error
        } = await supabaseClient

            .from('orders')

            .update({

                status:
                    'ثبت‌شده',

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                'id',
                order.id
            );


        if (error) {
            throw error;
        }


        log(
            currentUser.name,
            `سفارش ${fa(order.no)} ثبت‌شده شد`
        );


        await loadDB();

        renderOrders();

        toast(
            'سفارش به ثبت‌شده منتقل شد 🗂'
        );

    } catch (error) {

        showSupabaseError(
            error,
            'تغییر وضعیت سفارش انجام نشد'
        );

    }

}


/* =========================================================
   41. تصفیه سفارش
   ========================================================= */

async function settleOrder(order) {

    try {

        const {
            error
        } = await supabaseClient

            .from('orders')

            .update({

                received:
                    order.price,

                status:
                    'تصفیه‌شده',

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                'id',
                order.id
            );


        if (error) {
            throw error;
        }


        log(
            currentUser.name,
            `سفارش ${fa(order.no)} تصفیه شد`
        );


        await loadDB();

        renderOrders();

        toast(
            'سفارش تصفیه شد ✅'
        );

    } catch (error) {

        showSupabaseError(
            error,
            'تصفیه سفارش انجام نشد'
        );

    }

}


/* =========================================================
   42. بسته‌بندی
   ========================================================= */

async function updatePackaging(
    orderId,
    checked
) {

    try {

        const {
            error
        } = await supabaseClient

            .from('orders')

            .update({

                is_packaged:
                    checked,

                updated_at:
                    new Date().toISOString()

            })

            .eq(
                'id',
                orderId
            );


        if (error) {
            throw error;
        }


        const order =
            uiOrders()
                .find(
                    o =>
                        String(o.id) ===
                        String(orderId)
                );


        if (order) {

            log(
                currentUser.name,
                `بسته‌بندی سفارش ${fa(order.no)}
                 ${checked ? 'انجام شد' : 'لغو شد'}`
            );

        }


        await loadDB();

    } catch (error) {

        showSupabaseError(
            error,
            'وضعیت بسته‌بندی ذخیره نشد'
        );

        renderOrders();

    }

}


/* =========================================================
   43. حذف سفارش
   ========================================================= */

async function deleteOrder(order) {

    try {

        const confirmed =
            await confirmDialog(
                `سفارش ${fa(order.no)}
                 «${order.job}»
                 برای همیشه حذف شود؟`
            );


        if (!confirmed) return;


        const {
            error
        } = await supabaseClient

            .from('orders')

            .delete()

            .eq(
                'id',
                order.id
            );


        if (error) {
            throw error;
        }


        log(
            currentUser.name,
            `سفارش ${fa(order.no)} حذف شد`
        );


        await loadDB();

        renderOrders();

        toast(
            'سفارش حذف شد 🗑',
            'info'
        );

    } catch (error) {

        showSupabaseError(
            error,
            'حذف سفارش انجام نشد'
        );

    }

}


/* =========================================================
   44. مشتریان
   ========================================================= */

function renderCustomers() {

    const list =
        customersAgg();


    const body =
        $('#custBody');


    if (!body) return;


    body.innerHTML =
        list.length

            ? list.map(
                customer => `

                    <tr>

                        <td>
                            <b>
                                ${esc(
                                    customer.name
                                )}
                            </b>
                        </td>

                        <td
                            dir="ltr"
                            style="text-align:right"
                        >
                            ${esc(
                                customer.phone
                            )}
                        </td>

                        <td>
                            ${fa(
                                customer.orders
                            )}
                        </td>

                        <td>
                            ${money(
                                customer.totalAFN,
                                'AFN'
                            )}
                        </td>

                        <td>
                            ${money(
                                customer.paidAFN,
                                'AFN'
                            )}
                        </td>

                        <td
                            class="${
                                customer.balanceAFN > 0
                                    ? 'rem-pos'
                                    : 'rem-zero'
                            }"
                        >
                            ${money(
                                customer.balanceAFN,
                                'AFN'
                            )}
                        </td>

                        <td>

                            ${
                                customer.last
                                    ? `
                                        ${esc(
                                            customer.last.job
                                        )}

                                        <span class="muted">
                                            ${dFa(
                                                customer.last.date
                                            )}
                                        </span>
                                      `
                                    : '—'
                            }

                        </td>

                        <td>

                            <div class="ops">

                                <button
                                    class="ibtn"
                                    data-cact="view"
                                    data-customer-id="${customer.id}"
                                    title="مشاهده سفارشات"
                                >
                                    📋
                                </button>

                                <button
                                    class="ibtn"
                                    data-cact="stmt"
                                    data-customer-id="${customer.id}"
                                    title="چاپ صورت حساب"
                                >
                                    🖨
                                </button>

                            </div>

                        </td>

                    </tr>

                `
            ).join('')

            : `
                <tr class="empty">

                    <td colspan="8">
                        مشتری‌ای یافت نشد
                    </td>

                </tr>
              `;

}


/* =========================================================
   45. مالی
   ========================================================= */

function renderFinance() {

    const now =
        Date.now();


    const chips = [

        [
            'درآمد امروز',
            incomeSince(
                dayStart(now)
            )
        ],

        [
            'هفتگی',
            incomeSince(
                now - 7 * 864e5
            )
        ],

        [
            'ماهانه',
            incomeSince(
                now - 30 * 864e5
            )
        ],

        [
            'مجموع دریافتی',
            uiOrders()
                .reduce(
                    (sum, order) =>
                        sum +
                        (
                            order.currency ===
                            'USD'
                                ? order.paid *
                                  order.rate
                                : order.paid
                        ),
                    0
                )
        ],

        [
            'مجموع فروش',
            salesTotal()
        ],

        [
            'مانده / بدهی',
            debtTotal()
        ]

    ];


    const container =
        $('#finChips');


    if (container) {

        container.innerHTML =
            chips.map(
                ([label, value], index) => `

                    <div
                        class="mini"
                        style="
                            animation-delay:
                            ${index * 0.05}s
                        "
                    >

                        <div class="lbl">
                            ${esc(label)}
                        </div>

                        <div class="num">
                            ${money(value)}
                        </div>

                    </div>

                `
            ).join('');

    }


    const debtors =
        customersAgg()
            .filter(
                customer =>
                    customer.balanceAFN > 0
            );


    const body =
        $('#debtBody');


    if (!body) return;


    body.innerHTML =
        debtors.length

            ? debtors.map(
                customer => `

                    <tr>

                        <td>
                            <b>
                                ${esc(
                                    customer.name
                                )}
                            </b>
                        </td>

                        <td>
                            ${esc(
                                customer.phone
                            )}
                        </td>

                        <td>
                            ${fa(
                                customer.orders
                            )}
                        </td>

                        <td>
                            ${money(
                                customer.totalAFN
                            )}
                        </td>

                        <td>
                            ${money(
                                customer.paidAFN
                            )}
                        </td>

                        <td class="rem-pos">
                            ${money(
                                customer.balanceAFN
                            )}
                        </td>

                        <td>

                            <button
                                class="ibtn"
                                data-cact="stmt"
                                data-customer-id="${customer.id}"
                            >
                                🖨
                            </button>

                        </td>

                    </tr>

                `
            ).join('')

            : `
                <tr class="empty">

                    <td colspan="7">
                        🎉 هیچ بدهی‌ای وجود ندارد
                    </td>

                </tr>
              `;

}


/* =========================================================
   46. کاربران
   =========================================================
   نکته:
   در نسخه فعلی پروژه جدول users سمت Supabase قطعی نیست.
   بنابراین این بخش را فعلاً از سیستم محلی حذف نکرده‌ایم،
   ولی برای ورود واقعی بهتر است در مرحله بعد Supabase Auth
   استفاده شود.
   ========================================================= */

function renderUsers() {

    const body =
        $('#usersBody');

    if (!body) return;


    const users =
        DB.users || [];


    body.innerHTML =
        users.length

            ? users.map(
                user => `

                    <tr>

                        <td>
                            <b>
                                ${esc(
                                    user.name
                                )}
                            </b>
                        </td>

                        <td>
                            ${esc(
                                user.username
                            )}
                        </td>

                        <td>
                            <span class="badge st-b">
                                ${esc(
                                    ROLES[
                                        user.role
                                    ] ||
                                    user.role
                                )}
                            </span>
                        </td>

                        <td>
                            <span class="muted">
                                مدیریت از Supabase Auth
                            </span>
                        </td>

                    </tr>

                `
            ).join('')

            : `
                <tr class="empty">

                    <td colspan="4">
                        کاربران از طریق
                        Supabase Auth
                        مدیریت خواهند شد.
                    </td>

                </tr>
              `;

}


/* =========================================================
   47. تنظیمات
   ========================================================= */

function renderSettings() {

    const shop =
        $('#shopName');


    if (shop) {

        shop.value =
            DB.settings.shop ||
            APP.shopName;

    }


    const snap =
        $('#snapList');


    if (snap) {

        snap.innerHTML = `

            <p class="hint">

                اطلاعات اصلی سیستم
                در Supabase ذخیره می‌شود.

                <br>

                پشتیبان‌گیری کامل
                در مرحله بعد به‌صورت
                Database Backup
                اضافه خواهد شد.

            </p>

        `;

    }


    const logs =
        $('#logBody');


    if (logs) {

        logs.innerHTML = `

            <tr>

                <td colspan="3">

                    تاریخچه فعلی در
                    Console ثبت می‌شود.

                </td>

            </tr>

        `;

    }

}


/* =========================================================
   48. ذخیره نام چاپخانه
   ========================================================= */

async function saveShopName() {

    const input =
        $('#shopName');


    const name =
        input?.value?.trim();


    if (!name) {

        toast(
            'نام چاپخانه نمی‌تواند خالی باشد.',
            'err'
        );

        return;

    }


    localStorage.setItem(
        'chapyar_shop_name',
        name
    );


    DB.settings.shop =
        name;


    toast(
        'نام چاپخانه ذخیره شد ✔'
    );

}


/* =========================================================
   49. نمودار
   ========================================================= */

function setupCanvas(canvas) {

    if (!canvas) {
        return null;
    }


    const rect =
        canvas.getBoundingClientRect();


    const ratio =
        window.devicePixelRatio || 1;


    canvas.width =
        rect.width * ratio;

    canvas.height =
        rect.height * ratio;


    const ctx =
        canvas.getContext('2d');


    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );


    return {

        ctx,

        W:
            rect.width,

        H:
            rect.height

    };

}


function cssVar(
    name,
    fallback
) {

    return (
        getComputedStyle(
            document.documentElement
        )
        .getPropertyValue(name)
        .trim()
        ||
        fallback
    );

}


function rr(
    ctx,
    x,
    y,
    w,
    h,
    r
) {

    r =
        Math.min(
            r,
            h / 2,
            w / 2
        );


    ctx.beginPath();

    ctx.moveTo(
        x,
        y + h
    );

    ctx.lineTo(
        x,
        y + r
    );

    ctx.arcTo(
        x,
        y,
        x + r,
        y,
        r
    );

    ctx.lineTo(
        x + w - r,
        y
    );

    ctx.arcTo(
        x + w,
        y,
        x + w,
        y + r,
        r
    );

    ctx.lineTo(
        x + w,
        y + h
    );

    ctx.closePath();

}


function monthBuckets(
    count
) {

    const result = [];

    const now =
        new Date();


    for (
        let i = count - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );


        result.push({

            key:
                date.getFullYear() *
                    12 +
                date.getMonth(),

            label:
                new Intl.DateTimeFormat(
                    'fa-IR-u-ca-persian',
                    {
                        month:
                            'long'
                    }
                ).format(date),

            value:
                0

        });

    }


    return result;

}


function fillBuckets(
    buckets
) {

    uiOrders().forEach(
        order => {

            const date =
                new Date(
                    order.date
                );


            const key =
                date.getFullYear() *
                    12 +
                date.getMonth();


            const bucket =
                buckets.find(
                    item =>
                        item.key ===
                        key
                );


            if (bucket) {

                const received =
                    order.currency ===
                    'USD'

                        ? order.paid *
                          order.rate

                        : order.paid;


                bucket.value +=
                    received;

            }

        }
    );


    return buckets;

}


function barChart(
    canvas,
    buckets
) {

    if (!canvas) return;


    const setup =
        setupCanvas(
            canvas
        );


    if (!setup) return;


    const {
        ctx,
        W,
        H
    } = setup;


    const pad = {

        t: 28,

        b: 26,

        l: 6,

        r: 6

    };


    const max =
        Math.max(
            ...buckets.map(
                b => b.value
            ),
            1
        );


    const cyan =
        cssVar(
            '--cy',
            '#00a6c8'
        );


    const txt =
        cssVar(
            '--txt2',
            '#667'
        );


    const n =
        buckets.length;


    const bw =
        (
            W -
            pad.l -
            pad.r
        ) / n;


    const width =
        Math.min(
            bw * 0.55,
            48
        );


    const bars =
        buckets.map(
            (bucket, index) => {

                const h =
                    (
                        bucket.value /
                        max
                    ) *
                    (
                        H -
                        pad.t -
                        pad.b
                    );


                return {

                    x:
                        pad.l +
                        bw * index +
                        (
                            bw -
                            width
                        ) / 2,

                    y:
                        H -
                        pad.b -
                        h,

                    w:
                        width,

                    h,

                    label:
                        bucket.label,

                    value:
                        bucket.value

                };

            }
        );


    canvas._bars =
        bars;


    const start =
        performance.now();


    function frame(now) {

        const p =
            Math.min(
                (
                    now -
                    start
                ) / 700,
                1
            );


        const ease =
            1 -
            Math.pow(
                1 - p,
                3
            );


        ctx.clearRect(
            0,
            0,
            W,
            H
        );


        ctx.strokeStyle =
            cssVar(
                '--border',
                '#ddd'
            );


        ctx.beginPath();

        ctx.moveTo(
            pad.l,
            H - pad.b + .5
        );

        ctx.lineTo(
            W - pad.r,
            H - pad.b + .5
        );

        ctx.stroke();


        bars.forEach(
            bar => {

                const height =
                    bar.h *
                    ease;


                ctx.fillStyle =
                    cyan;


                if (
                    height > 1
                ) {

                    rr(
                        ctx,
                        bar.x,
                        H -
                            pad.b -
                            height,
                        bar.w,
                        height,
                        5
                    );

                    ctx.fill();

                }


                ctx.fillStyle =
                    txt;


                ctx.font =
                    '11px Vazirmatn';


                ctx.textAlign =
                    'center';


                ctx.fillText(
                    bar.label,
                    bar.x +
                        bar.w / 2,
                    H - 8
                );


                if (
                    bar.value > 0 &&
                    p > .85
                ) {

                    ctx.fillText(
                        fa(
                            bar.value
                        ),
                        bar.x +
                            bar.w / 2,
                        H -
                            pad.b -
                            height -
                            7
                    );

                }

            }
        );


        if (
            p < 1
        ) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );


    tipBind(canvas);

}


function donut(
    canvas,
    parts
) {

    if (!canvas) return;


    const setup =
        setupCanvas(
            canvas
        );


    if (!setup) return;


    const {
        ctx,
        W,
        H
    } = setup;


    const total =
        parts.reduce(
            (sum, part) =>
                sum +
                part.value,
            0
        ) || 1;


    const cx =
        W / 2;

    const cy =
        H / 2;


    const R =
        Math.min(
            W,
            H
        ) / 2 -
        10;


    const r =
        R * .62;


    const start =
        performance.now();


    function frame(now) {

        const p =
            Math.min(
                (
                    now -
                    start
                ) / 750,
                1
            );


        const ease =
            1 -
            Math.pow(
                1 - p,
                3
            );


        ctx.clearRect(
            0,
            0,
            W,
            H
        );


        let angle =
            -Math.PI / 2;


        parts.forEach(
            part => {

                const sweep =
                    (
                        part.value /
                        total
                    ) *
                    Math.PI *
                    2 *
                    ease;


                ctx.beginPath();

                ctx.moveTo(
                    cx,
                    cy
                );

                ctx.arc(
                    cx,
                    cy,
                    R,
                    angle,
                    angle + sweep
                );

                ctx.closePath();

                ctx.fillStyle =
                    part.color;

                ctx.fill();


                angle +=
                    sweep;

            }
        );


        ctx.globalCompositeOperation =
            'destination-out';


        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            r,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.globalCompositeOperation =
            'source-over';


        ctx.fillStyle =
            cssVar(
                '--txt',
                '#111'
            );


        ctx.textAlign =
            'center';


        ctx.font =
            '26px Lalezar';


        ctx.fillText(
            fa(total),
            cx,
            cy + 4
        );


        ctx.font =
            '11px Vazirmatn';


        ctx.fillStyle =
            cssVar(
                '--txt2',
                '#667'
            );


        ctx.fillText(
            'سفارش',
            cx,
            cy + 22
        );


        if (
            p < 1
        ) {

            requestAnimationFrame(
                frame
            );

        }

    }


    requestAnimationFrame(
        frame
    );

}


/* =========================================================
   50. Tooltip نمودار
   ========================================================= */

function tipBind(canvas) {

    if (!canvas) return;


    if (
        canvas._tipBound
    ) return;


    canvas._tipBound =
        true;


    canvas.addEventListener(
        'mousemove',
        event => {

            const rect =
                canvas.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            const y =
                event.clientY -
                rect.top;


            const hit =
                (
                    canvas._bars ||
                    []
                ).find(
                    bar =>
                        x >= bar.x &&
                        x <=
                            bar.x +
                            bar.w &&
                        y >=
                            bar.y -
                            6
                );


            const tip =
                $('#chartTip');


            if (!tip) return;


            if (hit) {

                tip.style.display =
                    'block';


                tip.style.left =
                    (
                        event.clientX +
                        14
                    ) + 'px';


                tip.style.top =
                    (
                        event.clientY -
                        34
                    ) + 'px';


                tip.innerHTML =
                    `${esc(
                        hit.label
                    )}: <b>${money(
                        hit.value
                    )}</b>`;

            }

            else {

                tip.style.display =
                    'none';

            }

        }
    );


    canvas.addEventListener(
        'mouseleave',
        () => {

            const tip =
                $('#chartTip');

            if (tip) {

                tip.style.display =
                    'none';

            }

        }
    );

}


/* =========================================================
   51. چاپ
   ========================================================= */

function doPrint(html) {

    const printArea =
        $('#printArea');


    if (!printArea) {

        window.print();

        return;

    }


    printArea.innerHTML =
        html;


    document.body
        .classList
        .add('printing');


    const done =
        () => {

            document.body
                .classList
                .remove('printing');


            printArea.innerHTML =
                '';


            window.removeEventListener(
                'afterprint',
                done
            );

        };


    window.addEventListener(
        'afterprint',
        done
    );


    setTimeout(
        () => window.print(),
        100
    );

}


/* =========================================================
   52. Header چاپ
   ========================================================= */

function paperHead(
    title
) {

    return `

        <div class="cmyk">

            <i></i>
            <i></i>
            <i></i>
            <i></i>

        </div>


        <header class="p-head">

            <div>

                <h1>
                    ${esc(
                        DB.settings.shop
                    )}
                </h1>

                <p>
                    ${esc(title)}
                </p>

            </div>


            <div class="p-no">

                <b>
                    تاریخ صدور:
                </b>

                ${dFa(
                    new Date()
                )}

                <br>

                <b>
                    اپراتور:
                </b>

                ${esc(
                    currentUser?.name ||
                    ''
                )}

            </div>

        </header>

    `;

}


/* =========================================================
   53. فاکتور
   ========================================================= */

function invoiceHTML(
    order
) {

    const currency =
        order.currency ||
        'AFN';


    return `

        <div class="paper">

            ${paperHead(
                'فاکتور سفارش چاپ'
            )}


            <section class="p-grid">

                <div>
                    <b>مشتری:</b>
                    ${esc(
                        order.customer
                    )}
                </div>

                <div>
                    <b>تماس:</b>
                    ${esc(
                        order.phone
                    )}
                </div>

                <div>
                    <b>شماره سفارش:</b>
                    ${fa(
                        order.no
                    )}
                </div>

                <div>
                    <b>تاریخ تحویل:</b>
                    ${
                        order.delivery
                            ? dFa(
                                order.delivery
                            )
                            : '—'
                    }
                </div>

                <div
                    style="grid-column:span 2"
                >
                    <b>آدرس:</b>
                    ${esc(
                        order.address ||
                        '—'
                    )}
                </div>

            </section>


            <table class="p-table">

                <tr>

                    <th>
                        شرح کار
                    </th>

                    <td>
                        ${esc(
                            order.job
                        )}

                        ${
                            order.desc
                                ? ' — ' +
                                  esc(
                                      order.desc
                                  )
                                : ''
                        }
                    </td>

                </tr>


                <tr>

                    <th>
                        تعداد
                    </th>

                    <td>
                        ${fa(
                            order.qty
                        )}
                    </td>

                </tr>


                <tr>

                    <th>
                        رنگ چاپ
                    </th>

                    <td>
                        ${esc(
                            order.color
                        )}
                    </td>

                </tr>


                <tr>

                    <th>
                        سایز / جنس
                    </th>

                    <td>
                        ${esc(
                            order.size ||
                            '—'
                        )}

                        /

                        ${esc(
                            order.material ||
                            '—'
                        )}
                    </td>

                </tr>


                <tr>

                    <th>
                        بسته‌بندی
                    </th>

                    <td>
                        ${
                            order.packaged
                                ? '✔ انجام شده'
                                : 'انجام نشده'
                        }
                    </td>

                </tr>

            </table>


            <div class="p-money">

                <div>

                    قیمت کل

                    <br>

                    <b>
                        ${money(
                            order.price,
                            currency
                        )}
                    </b>

                </div>


                <div>

                    مبلغ رسیده

                    <br>

                    <b>
                        ${money(
                            order.paid,
                            currency
                        )}
                    </b>

                </div>


                <div class="rem">

                    مبلغ الباقی

                    <br>

                    <b>
                        ${money(
                            remain(order),
                            currency
                        )}
                    </b>

                </div>

            </div>


            <footer>

                <span>
                    از اعتماد شما سپاس‌گزاریم 🌷
                </span>

                <span>
                    امضا و مهر چاپخانه
                </span>

            </footer>

        </div>

    `;

}


/* =========================================================
   54. فهرست سفارشات چاپ
   ========================================================= */

function orderRowCells(
    order
) {

    return `

        <td>
            ${fa(order.no)}
        </td>

        <td>
            ${dFa(order.date)}
        </td>

        <td>
            ${esc(order.job)}
        </td>

        <td>
            ${esc(order.customer)}
        </td>

        <td>
            ${fa(order.qty)}
        </td>

        <td>
            ${money(
                order.price,
                order.currency
            )}
        </td>

        <td>
            ${money(
                order.paid,
                order.currency
            )}
        </td>

        <td>
            ${money(
                remain(order),
                order.currency
            )}
        </td>

        <td>
            ${esc(order.status)}
        </td>

    `;

}


function listHTML(
    title,
    list
) {

    const total =
        list.reduce(
            (sum, order) =>
                sum +
                (
                    order.currency ===
                    'USD'
                        ? order.price *
                          order.rate
                        : order.price
                ),
            0
        );


    const received =
        list.reduce(
            (sum, order) =>
                sum +
                (
                    order.currency ===
                    'USD'
                        ? order.paid *
                          order.rate
                        : order.paid
                ),
            0
        );


    return `

        <div class="paper">

            ${paperHead(title)}


            <table class="p-table">

                <thead>

                    <tr>

                        <th>
                            شماره
                        </th>

                        <th>
                            تاریخ
                        </th>

                        <th>
                            نام کار
                        </th>

                        <th>
                            سفارش‌دهنده
                        </th>

                        <th>
                            تعداد
                        </th>

                        <th>
                            قیمت
                        </th>

                        <th>
                            دریافتی
                        </th>

                        <th>
                            الباقی
                        </th>

                        <th>
                            وضعیت
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${list.map(
                        order =>
                            `<tr>
                                ${orderRowCells(
                                    order
                                )}
                             </tr>`
                    ).join('')}

                </tbody>


                <tfoot>

                    <tr>

                        <th colspan="5">

                            جمع کل
                            (
                            ${fa(
                                list.length
                            )}
                            سفارش
                            )

                        </th>

                        <th>
                            ${money(total)}
                        </th>

                        <th>
                            ${money(received)}
                        </th>

                        <th>
                            ${money(
                                Math.max(
                                    total -
                                    received,
                                    0
                                )
                            )}
                        </th>

                        <th></th>

                    </tr>

                </tfoot>

            </table>


            <footer>

                <span>
                    ${esc(
                        DB.settings.shop
                    )}
                </span>

                <span>
                    امضا و مهر
                </span>

            </footer>

        </div>

    `;

}


/* =========================================================
   55. صورت حساب مشتری
   ========================================================= */

function statementHTML(
    customer
) {

    const list =
        uiOrders()
            .filter(
                order =>
                    String(
                        order.customer_id
                    ) ===
                    String(
                        customer.id
                    )
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );


    return listHTML(
        `صورت‌حساب مشتری:
         ${customer.name}
         — ${customer.phone}`,
        list
    );

}


/* =========================================================
   56. خروجی CSV
   ========================================================= */

function exportCSV() {

    const rows =
        filteredOrders();


    const head = [

        'شماره',

        'تاریخ',

        'نام کار',

        'سفارش‌دهنده',

        'تماس',

        'تعداد',

        'رنگ',

        'سایز',

        'جنس',

        'بسته‌بندی',

        'ارز',

        'نرخ دالر',

        'قیمت',

        'دریافتی',

        'باقیمانده',

        'وضعیت'

    ];


    const lines = [

        head,

        ...rows.map(
            order => [

                fa(order.no),

                dFa(order.date),

                order.job,

                order.customer,

                order.phone,

                order.qty,

                order.color,

                order.size,

                order.material,

                order.packaged
                    ? 'بلی'
                    : 'نخیر',

                order.currency,

                order.rate,

                order.price,

                order.paid,

                remain(order),

                order.status

            ]
        )

    ];


    const csv =
        '\uFEFF' +
        lines
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value ?? ''
                                ).replace(
                                    /"/g,
                                    '""'
                                )}"`
                        )
                        .join(',')
            )
            .join('\n');


    const link =
        document.createElement(
            'a'
        );


    link.href =
        URL.createObjectURL(
            new Blob(
                [csv],
                {
                    type:
                        'text/csv;charset=utf-8'
                }
            )
        );


    link.download =
        'سفارشات-چاپیار.csv';


    link.click();


    URL.revokeObjectURL(
        link.href
    );


    toast(
        'فایل CSV دانلود شد ⬇'
    );

}


/* =========================================================
   57. مودال
   ========================================================= */

function openModal(id) {

    const modal =
        $('#' + id);

    if (modal) {

        modal.classList.add(
            'open'
        );

    }

}


function closeModals() {

    $$('.modal.open')
        .forEach(
            modal =>
                modal.classList.remove(
                    'open'
                )
        );

}


function confirmDialog(
    message
) {

    const text =
        $('#confirmText');


    if (text) {

        text.textContent =
            message;

    }


    openModal(
        'modalConfirm'
    );


    return new Promise(
        resolve => {

            confirmRes =
                resolve;

        }
    );

}


/* =========================================================
   58. Toast
   ========================================================= */

function toast(
    message,
    type = 'ok'
) {

    const container =
        $('#toasts');


    if (!container) {

        console.log(
            message
        );

        return;

    }


    const element =
        document.createElement(
            'div'
        );


    element.className =
        `toast ${type}`;


    element.textContent =
        message;


    container.appendChild(
        element
    );


    requestAnimationFrame(
        () =>
            element.classList.add(
                'show'
            )
    );


    setTimeout(
        () => {

            element.classList.remove(
                'show'
            );


            setTimeout(
                () =>
                    element.remove(),
                380
            );

        },
        3300
    );

}


/* =========================================================
   59. Theme
   ========================================================= */

function applyTheme(
    theme
) {

    const valid =
        theme === 'dark'
            ? 'dark'
            : 'light';


    document.documentElement
        .dataset
        .theme =
        valid;


    localStorage.setItem(
        'ps_theme',
        valid
    );


    const button =
        $('#themeToggle');


    if (button) {

        button.textContent =
            valid === 'dark'
                ? '☀️'
                : '🌙';

    }

}


/* =========================================================
   60. Navigation
   ========================================================= */

const RENDER = {

    dashboard:
        renderDashboard,

    neworder:
        renderNewOrder,

    orders:
        renderOrders,

    customers:
        renderCustomers,

    finance:
        renderFinance,

    users:
        renderUsers,

    settings:
        renderSettings

};


function navigate(
    page
) {

    if (
        !currentUser
    ) return;


    if (
        !PERMS[page]?.includes(
            currentUser.role
        )
    ) {

        page =
            Object.keys(PERMS)
                .find(
                    key =>
                        PERMS[key]
                            .includes(
                                currentUser.role
                            )
                );

    }


    currentPage =
        page;


    $$('.page')
        .forEach(
            section =>
                section.classList.toggle(
                    'active',
                    section.dataset.page ===
                    page
                )
        );


    $$('#navList .nav-item')
        .forEach(
            item =>
                item.classList.toggle(
                    'active',
                    item.dataset.page ===
                    page
                )
        );


    const title =
        $('#pageTitle');


    if (title) {

        title.textContent =
            TITLES[page];

    }


    if (
        page === 'orders'
    ) {

        const search =
            $('#globalSearch');

        if (search) {

            search.value =
                F.q;

        }

    }


    RENDER[page]?.();


    document.body
        .classList
        .remove(
            'side-open'
        );

}


/* =========================================================
   61. ورود
   =========================================================
   
   فعلاً این بخش با کاربران قدیمی Frontend سازگار نگه
   داشته شده است.

   اما برای نسخه نهایی واقعی باید به:
   Supabase Auth
   منتقل شود.
   ========================================================= */

async function doLogin(
    username,
    password
) {

    /*
       اگر در آینده Supabase Auth فعال شد،
       همین تابع با signInWithPassword جایگزین
       خواهد شد.
    */


    const localUsers = [

        {
            username:
                'admin',

            pass:
                'admin123',

            name:
                'مدیر سیستم',

            role:
                'admin'
        }

    ];


    const user =
        localUsers.find(
            item =>
                item.username ===
                    username &&
                item.pass ===
                    password
        );


    if (!user) {

        return false;

    }


    currentUser = {

        username:
            user.username,

        name:
            user.name,

        role:
            user.role

    };


    sessionStorage.setItem(
        'ps_user',
        JSON.stringify(
            currentUser
        )
    );


    return true;

}


/* =========================================================
   62. ورود به برنامه
   ========================================================= */

function enterApp(
    welcome = true
) {

    const login =
        $('#loginScreen');

    const app =
        $('#app');


    login?.classList.add(
        'hidden'
    );

    app?.classList.remove(
        'hidden'
    );


    const name =
        $('#userName');

    const role =
        $('#userRole');


    if (name) {

        name.textContent =
            currentUser.name;

    }


    if (role) {

        role.textContent =
            ROLES[
                currentUser.role
            ] ||
            currentUser.role;

    }


    $$('#navList .nav-item')
        .forEach(
            item => {

                const page =
                    item.dataset.page;


                item.style.display =
                    PERMS[page]?.includes(
                        currentUser.role
                    )
                        ? ''
                        : 'none';

            }
        );


    const first =
        Object.keys(PERMS)
            .find(
                page =>
                    PERMS[page]
                        .includes(
                            currentUser.role
                        )
            );


    navigate(
        first ||
        'dashboard'
    );


    if (welcome) {

        toast(
            `خوش آمدید،
             ${currentUser.name} 👋`
        );

    }

}


/* =========================================================
   63. خروج
   ========================================================= */

function logout() {

    sessionStorage.removeItem(
        'ps_user'
    );


    currentUser =
        null;


    $('#app')
        ?.classList
        .add(
            'hidden'
        );


    $('#loginScreen')
        ?.classList
        .remove(
            'hidden'
        );


    const password =
        $('#loginPass');


    if (password) {

        password.value =
            '';

    }

}


/* =========================================================
   64. Bind اصلی
   ========================================================= */

function bind() {


    /* -----------------------------------------
       Login
       ----------------------------------------- */

    const loginForm =
        $('#loginForm');


    loginForm?.addEventListener(
        'submit',
        async event => {

            event.preventDefault();


            const username =
                $('#loginUser')
                    ?.value
                    ?.trim() ||
                '';


            const password =
                $('#loginPass')
                    ?.value ||
                '';


            const success =
                await doLogin(
                    username,
                    password
                );


            if (success) {

                const error =
                    $('#loginErr');

                if (error) {

                    error.textContent =
                        '';

                }


                enterApp();

            }

            else {

                const error =
                    $('#loginErr');

                if (error) {

                    error.textContent =
                        'نام کاربری یا رمز عبور اشتباه است!';

                }

            }

        }
    );


    /* -----------------------------------------
       Demo buttons
       ----------------------------------------- */

    $$('.demo-btn')
        .forEach(
            button =>
                button.addEventListener(
                    'click',
                    () => {

                        $('#loginUser').value =
                            button.dataset.u;

                        $('#loginPass').value =
                            button.dataset.p;

                        $('#loginForm')
                            ?.requestSubmit();

                    }
                )
        );


    /* -----------------------------------------
       Navigation
       ----------------------------------------- */

    $('#navList')
        ?.addEventListener(
            'click',
            event => {

                const item =
                    event.target.closest(
                        '.nav-item'
                    );


                if (!item) return;


                navigate(
                    item.dataset.page
                );

            }
        );


    /* -----------------------------------------
       Logout
       ----------------------------------------- */

    $('#logoutBtn')
        ?.addEventListener(
            'click',
            logout
        );


    /* -----------------------------------------
       Theme
       ----------------------------------------- */

    $('#themeToggle')
        ?.addEventListener(
            'click',
            () =>
                applyTheme(
                    document.documentElement
                        .dataset
                        .theme ===
                        'dark'
                        ? 'light'
                        : 'dark'
                )
        );


    /* -----------------------------------------
       Mobile menu
       ----------------------------------------- */

    $('#hamburger')
        ?.addEventListener(
            'click',
            () =>
                document.body
                    .classList
                    .toggle(
                        'side-open'
                    )
        );


    $('#sideOverlay')
        ?.addEventListener(
            'click',
            () =>
                document.body
                    .classList
                    .remove(
                        'side-open'
                    )
        );


    /* -----------------------------------------
       Global Search
       ----------------------------------------- */

    let searchTimer;


    $('#globalSearch')
        ?.addEventListener(
            'input',
            event => {

                clearTimeout(
                    searchTimer
                );


                searchTimer =
                    setTimeout(
                        () => {

                            F.q =
                                event.target.value;


                            if (
                                currentPage !==
                                'orders'
                            ) {

                                navigate(
                                    'orders'
                                );

                            }

                            else {

                                renderOrders();

                            }

                        },
                        180
                    );

            }
        );


    /* -----------------------------------------
       Keyboard
       ----------------------------------------- */

    document.addEventListener(
        'keydown',
        event => {

            if (
                (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        'k'
                ) ||
                (
                    event.key === '/' &&
                    !/INPUT|TEXTAREA|SELECT/
                        .test(
                            document.activeElement
                                ?.tagName ||
                            ''
                        )
                )
            ) {

                event.preventDefault();

                $('#globalSearch')
                    ?.focus();

            }


            if (
                event.key ===
                'Escape'
            ) {

                closeModals();

            }

        }
    );


    /* -----------------------------------------
       Close modal
       ----------------------------------------- */

    document.addEventListener(
        'click',
        event => {

            if (
                event.target.closest(
                    '[data-close]'
                )
            ) {

                closeModals();

            }

        }
    );


    /* -----------------------------------------
       Dashboard print
       ----------------------------------------- */

    $('#btnPrintDash')
        ?.addEventListener(
            'click',
            () =>
                doPrint(
                    dashPrintHTML()
                )
        );


    /* -----------------------------------------
       Filters
       ----------------------------------------- */

    $('#fltStatus')
        ?.addEventListener(
            'change',
            event => {

                F.status =
                    event.target.value;

                renderOrders();

            }
        );


    $('#fltRange')
        ?.addEventListener(
            'change',
            event => {

                F.range =
                    event.target.value;

                renderOrders();

            }
        );


    $('#fltClear')
        ?.addEventListener(
            'click',
            () => {

                F = {

                    q: '',
                    status: '',
                    range: ''

                };


                if (
                    $('#globalSearch')
                ) {

                    $('#globalSearch')
                        .value =
                        '';

                }


                if (
                    $('#fltStatus')
                ) {

                    $('#fltStatus')
                        .value =
                        '';

                }


                if (
                    $('#fltRange')
                ) {

                    $('#fltRange')
                        .value =
                        '';

                }


                renderOrders();

            }
        );


    $('#statusChips')
        ?.addEventListener(
            'click',
            event => {

                const chip =
                    event.target.closest(
                        '.chip'
                    );


                if (!chip) return;


                F.status =
                    chip.dataset.st;


                if (
                    $('#fltStatus')
                ) {

                    $('#fltStatus')
                        .value =
                        F.status;

                }


                renderOrders();

            }
        );


    /* -----------------------------------------
       New order
       ----------------------------------------- */

    $('#btnGoNew')
        ?.addEventListener(
            'click',
            () =>
                navigate(
                    'neworder'
                )
        );


    /* -----------------------------------------
       Print orders
       ----------------------------------------- */

    $('#btnPrintOrders')
        ?.addEventListener(
            'click',
            () =>
                doPrint(
                    listHTML(
                        'فهرست سفارشات',
                        filteredOrders()
                    )
                )
        );


    /* -----------------------------------------
       CSV
       ----------------------------------------- */

    $('#btnCSV')
        ?.addEventListener(
            'click',
            exportCSV
        );


    /* -----------------------------------------
       Order actions
       ----------------------------------------- */

    $('#ordersBody')
        ?.addEventListener(
            'click',
            async event => {

                const button =
                    event.target.closest(
                        '[data-act]'
                    );


                if (!button) return;


                const row =
                    button.closest(
                        'tr'
                    );


                const id =
                    row?.dataset?.id;


                const order =
                    uiOrders()
                        .find(
                            item =>
                                String(
                                    item.id
                                ) ===
                                String(id)
                        );


                if (!order) return;


                const action =
                    button.dataset.act;


                if (
                    action ===
                    'invoice'
                ) {

                    doPrint(
                        invoiceHTML(
                            order
                        )
                    );

                    return;

                }


                if (
                    action ===
                    'edit'
                ) {

                    openEdit(
                        order
                    );

                    return;

                }


                if (
                    action ===
                    'reg'
                ) {

                    await registerOrder(
                        order
                    );

                    return;

                }


                if (
                    action ===
                    'settle'
                ) {

                    await settleOrder(
                        order
                    );

                    return;

                }


                if (
                    action ===
                    'del'
                ) {

                    await deleteOrder(
                        order
                    );

                }

            }
        );


    /* -----------------------------------------
       Packaging
       ----------------------------------------- */

    $('#ordersBody')
        ?.addEventListener(
            'change',
            async event => {

                const checkbox =
                    event.target.closest(
                        '[data-pack]'
                    );


                if (!checkbox) return;


                await updatePackaging(
                    checkbox.dataset.pack,
                    checkbox.checked
                );

            }
        );


    /* -----------------------------------------
       Customer actions
       ----------------------------------------- */

    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    '[data-cact]'
                );


            if (!button) return;


            const customer =
                customersAgg()
                    .find(
                        item =>
                            String(
                                item.id
                            ) ===
                            String(
                                button.dataset
                                    .customerId
                            )
                    );


            if (!customer) return;


            if (
                button.dataset.cact ===
                'stmt'
            ) {

                doPrint(
                    statementHTML(
                        customer
                    )
                );

            }


            if (
                button.dataset.cact ===
                'view'
            ) {

                F = {

                    q:
                        customer.phone,

                    status:
                        '',

                    range:
                        ''

                };


                if (
                    $('#fltStatus')
                ) {

                    $('#fltStatus')
                        .value =
                        '';

                }


                if (
                    $('#fltRange')
                ) {

                    $('#fltRange')
                        .value =
                        '';

                }


                navigate(
                    'orders'
                );


                toast(
                    `نمایش سفارشات
                     «${customer.name}»`,
                    'info'
                );

            }

        }
    );


    /* -----------------------------------------
       Print customers
       ----------------------------------------- */

    $('#btnPrintCusts')
        ?.addEventListener(
            'click',
            () => {

                const list =
                    customersAgg();


                const html = `

                    <div class="paper">

                        ${paperHead(
                            'فهرست مشتریان و حساب‌ها'
                        )}

                        <table class="p-table">

                            <tr>

                                <th>
                                    مشتری
                                </th>

                                <th>
                                    تماس
                                </th>

                                <th>
                                    سفارشات
                                </th>

                                <th>
                                    خرید
                                </th>

                                <th>
                                    پرداختی
                                </th>

                                <th>
                                    بدهی
                                </th>

                            </tr>


                            ${list.map(
                                customer =>
                                    `

                                    <tr>

                                        <td>
                                            ${esc(
                                                customer.name
                                            )}
                                        </td>

                                        <td>
                                            ${esc(
                                                customer.phone
                                            )}
                                        </td>

                                        <td>
                                            ${fa(
                                                customer.orders
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.totalAFN
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.paidAFN
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.balanceAFN
                                            )}
                                        </td>

                                    </tr>

                                    `
                            ).join('')}

                        </table>


                        <footer>

                            <span>
                                ${esc(
                                    DB.settings.shop
                                )}
                            </span>

                            <span>
                                امضا و مهر
                            </span>

                        </footer>

                    </div>

                `;


                doPrint(
                    html
                );

            }
        );


    /* -----------------------------------------
       Print finance
       ----------------------------------------- */

    $('#btnPrintFin')
        ?.addEventListener(
            'click',
            () =>
                doPrint(
                    finPrintHTML()
                )
        );


    /* -----------------------------------------
       Shop name
       ----------------------------------------- */

    $('#btnShop')
        ?.addEventListener(
            'click',
            saveShopName
        );


    /* -----------------------------------------
       Confirm modal
       ----------------------------------------- */

    $('#confirmYes')
        ?.addEventListener(
            'click',
            () => {

                closeModals();

                confirmRes?.(
                    true
                );

                confirmRes =
                    null;

            }
        );


    $('#confirmNo')
        ?.addEventListener(
            'click',
            () => {

                closeModals();

                confirmRes?.(
                    false
                );

                confirmRes =
                    null;

            }
        );

}


/* =========================================================
   65. گزارش چاپ پیشخوان
   ========================================================= */

function dashPrintHTML() {

    const now =
        Date.now();


    const rows = [

        [
            'سفارشات امروز',
            fa(
                uiOrders()
                    .filter(
                        order =>
                            new Date(
                                order.date
                            ).getTime() >=
                            dayStart(now)
                    )
                    .length
            )
        ],

        [
            'دریافتی امروز',
            money(
                incomeSince(
                    dayStart(now)
                )
            )
        ],

        [
            'دریافتی ۷ روز اخیر',
            money(
                incomeSince(
                    now -
                    7 *
                    864e5
                )
            )
        ],

        [
            'دریافتی ۳۰ روز اخیر',
            money(
                incomeSince(
                    now -
                    30 *
                    864e5
                )
            )
        ],

        [
            'در حال انجام',
            fa(
                stCount(
                    'در حال انجام'
                )
            )
        ],

        [
            'ثبت‌شده',
            fa(
                stCount(
                    'ثبت‌شده'
                )
            )
        ],

        [
            'تصفیه‌شده',
            fa(
                stCount(
                    'تصفیه‌شده'
                )
            )
        ],

        [
            'مجموع بدهی مشتریان',
            money(
                debtTotal()
            )
        ]

    ];


    return `

        <div class="paper">

            ${paperHead(
                'گزارش روزانه پیشخوان'
            )}

            <table class="p-table">

                ${rows.map(
                    ([key, value]) =>
                        `
                        <tr>

                            <th>
                                ${esc(key)}
                            </th>

                            <td>
                                ${value}
                            </td>

                        </tr>
                        `
                ).join('')}

            </table>


            <footer>

                <span>
                    ${esc(
                        DB.settings.shop
                    )}
                </span>

                <span>
                    تهیه‌شده توسط چاپ‌یار
                </span>

            </footer>

        </div>

    `;

}


/* =========================================================
   66. گزارش مالی چاپ
   ========================================================= */

function finPrintHTML() {

    const rows = [

        [
            'درآمد امروز',
            money(
                incomeSince(
                    dayStart(
                        new Date()
                    )
                )
            )
        ],

        [
            'درآمد هفتگی',
            money(
                incomeSince(
                    Date.now() -
                    7 *
                    864e5
                )
            )
        ],

        [
            'درآمد ماهانه',
            money(
                incomeSince(
                    Date.now() -
                    30 *
                    864e5
                )
            )
        ],

        [
            'مجموع دریافتی‌ها',
            money(
                incomeSince(0)
            )
        ],

        [
            'مجموع فروش',
            money(
                salesTotal()
            )
        ],

        [
            'مجموع بدهی مشتریان',
            money(
                debtTotal()
            )
        ]

    ];


    const debtors =
        customersAgg()
            .filter(
                customer =>
                    customer.balanceAFN > 0
            );


    return `

        <div class="paper">

            ${paperHead(
                'گزارش مالی'
            )}


            <table class="p-table">

                ${rows.map(
                    ([key, value]) =>
                        `
                        <tr>

                            <th>
                                ${esc(key)}
                            </th>

                            <td>
                                ${value}
                            </td>

                        </tr>
                        `
                ).join('')}

            </table>


            ${
                debtors.length

                    ? `

                        <h3>
                            بدهکاران
                        </h3>


                        <table class="p-table">

                            <tr>

                                <th>
                                    مشتری
                                </th>

                                <th>
                                    تماس
                                </th>

                                <th>
                                    خرید
                                </th>

                                <th>
                                    پرداختی
                                </th>

                                <th>
                                    بدهی
                                </th>

                            </tr>


                            ${debtors.map(
                                customer =>
                                    `

                                    <tr>

                                        <td>
                                            ${esc(
                                                customer.name
                                            )}
                                        </td>

                                        <td>
                                            ${esc(
                                                customer.phone
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.totalAFN
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.paidAFN
                                            )}
                                        </td>

                                        <td>
                                            ${money(
                                                customer.balanceAFN
                                            )}
                                        </td>

                                    </tr>

                                    `
                            ).join('')}

                        </table>

                      `

                    : ''
            }


            <footer>

                <span>
                    ${esc(
                        DB.settings.shop
                    )}
                </span>

                <span>
                    امضا و مهر
                </span>

            </footer>

        </div>

    `;

}


/* =========================================================
   67. Resize
   ========================================================= */

let resizeTimer;


window.addEventListener(
    'resize',
    () => {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    if (
                        currentPage ===
                        'dashboard'
                    ) {

                        renderDashboard();

                    }


                    if (
                        currentPage ===
                        'finance'
                    ) {

                        renderFinance();

                    }

                },
                250
            );

    }
);


/* =========================================================
   68. راه‌اندازی
   ========================================================= */

async function init() {

    try {

        /* Theme */

        applyTheme(
            localStorage.getItem(
                'ps_theme'
            ) ||
            'light'
        );


        /* Bind */

        bind();


        /* Connection */

        const connected =
            await testConnection();


        if (!connected) {

            console.error(
                'Supabase connection failed.'
            );

            return;

        }


        /* Load database */

        await loadDB();


        console.log(
            'چاپ‌یار آماده است.',
            {
                customers:
                    DB.customers.length,

                orders:
                    DB.orders.length,

                payments:
                    DB.payments.length
            }
        );


        /* Session */

        const session =
            sessionStorage.getItem(
                'ps_user'
            );


        if (session) {

            try {

                currentUser =
                    JSON.parse(
                        session
                    );


                if (
                    currentUser?.role
                ) {

                    enterApp(
                        false
                    );

                }

            } catch {

                sessionStorage.removeItem(
                    'ps_user'
                );

            }

        }

    } catch (error) {

        console.error(
            'Application initialization error:',
            error
        );


        toast(
            'راه‌اندازی سیستم با مشکل مواجه شد.',
            'err'
        );

    }

}


/* =========================================================
   69. شروع
   ========================================================= */

document.addEventListener(
    'DOMContentLoaded',
    init
);
