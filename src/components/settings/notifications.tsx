'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type UserProfileFormData } from '@/types';

interface NotificationsProps {
    users: UserProfileFormData[];
}

const NotificationSetting = ({ title, filterLabel, filterOptions }: { title: string, filterLabel: string, filterOptions: string[] }) => (
    <div className="grid grid-cols-3 items-center gap-4">
        <div className="col-span-1">
            <p className="font-semibold">{title}</p>
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Send {title.toLowerCase()} frequency:</label>
                <Select defaultValue="disabled">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="disabled">Disabled: Send changes does not run</SelectItem>
                        {/* Add other frequency options here */}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <label className="text-xs text-muted-foreground">{filterLabel}:</label>
                <Select defaultValue="all">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {filterOptions.map(opt => <SelectItem key={opt} value={opt.toLowerCase().replace(' ', '-')}>{opt}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
    </div>
);


export default function Notifications({ users }: NotificationsProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground mb-6">Automatically run tasks to send email to users based on information stored in Finale.</p>

            <div className="space-y-6">
                {users.map(user => (
                    <Card key={user.fullName}>
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-bold text-lg">{user.fullName}</h3>
                            <div className="space-y-6">
                                <NotificationSetting 
                                    title="Reorder alert"
                                    filterLabel="Location filter"
                                    filterOptions={['All locations']}
                                />
                                <NotificationSetting 
                                    title="Reorder summary"
                                    filterLabel="Location filter"
                                    filterOptions={['All locations']}
                                />
                                <NotificationSetting 
                                    title="Sales order alert"
                                    filterLabel="Sales source filter"
                                    filterOptions={[]}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
