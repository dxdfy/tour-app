import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import React, { useState, Component } from 'react'
import { AtButton } from 'taro-ui'
import { AtInput, AtForm } from 'taro-ui'

import './login.scss'

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const handleUsernameInput = (value) => {
        setUsername(value);
    }
    const handlePasswordInput = (value) => {
        setPassword(value);
    }
    const handleLogin = () => {
        const data = {
            username: username,
            password: password
        };
        console.log(data)
        wx.request({
            url: 'http://192.168.1.107:3007/api/login',
            method: 'POST',
            data: data,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: function (res) {
                console.log('Login successful:', res);
                if(res.data.message === '登录成功'){
                    console.log('登录成功',res.data.message);
                    wx.setStorageSync('token', res.data.token);
                    wx.setStorageSync('username', username);
                    wx.redirectTo({
                        url: '/pages/index/index'
                    });
                }
            },
            fail: function (error) {
                console.error('Login failed:', error);
            }
        });
    }
    return (
        <View className='login'>
            {/* <Input type='number' placeholder='原生刺激' /> */}
            <AtInput
                name='username'
                title='用户名'
                type='text'
                placeholder='请输入用户名'
                value={username}
                onChange={value => handleUsernameInput(value)}
            />
            <AtInput
                name='password'
                title='密码'
                type='password'
                placeholder='请输入密码'
                value={password}
                onChange={value => handlePasswordInput(value)}
            />
            <AtButton type='primary' size='normal' onClick={handleLogin}>登录</AtButton>
            <Text className='register-link' onClick={() => Taro.navigateTo({ url: '/pages/register/register' })}>点击注册</Text>
        </View>
    )
}
