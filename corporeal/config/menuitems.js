module.exports = [
    {
        title:'Home',
        href:'/dashboard',
        permissions:[]
    },
    {
        title:'Pages',
        href:'/pages/list',
        permissions:['view_pages'],
    },
    {
        title: 'User List',
        href: '/user/list',
        permissions: ['user_list']
    },
    {
        title:'User',
        href:'/user/edit',
        permissions:['user_edit']
    },
    {
        title: 'Logout',
        href:'/login/logout',
        permissions: ['']
    },
]
